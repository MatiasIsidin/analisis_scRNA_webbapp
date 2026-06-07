"""
Rutas de predicción y exportación de resultados.
"""
import logging
from typing import Optional
from fastapi import APIRouter, Request, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
import io

from app.schemas.prediction import PredictionResponse, CellPrediction
from app.utils.file_validator import (
    validate_file_size,
    validate_extension,
    load_csv,
    load_h5ad,
)
from app.services.export_service import generate_results_csv, generate_summary_csv

logger = logging.getLogger(__name__)
router = APIRouter()

# Almacenamiento en memoria de la última predicción (para exportación)
_last_prediction: Optional[dict] = None


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Clasificar tipos celulares",
    description=(
        "Recibe un archivo CSV o H5AD con datos de scRNA-seq procesados "
        "(50 componentes PCA) y retorna la clasificación celular."
    ),
)
async def predict(
    request: Request,
    file: UploadFile = File(..., description="Archivo CSV o H5AD con datos PCA"),
):
    global _last_prediction

    # 1. Validar extensión
    try:
        ext = validate_extension(file.filename or "")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Leer contenido
    content = await file.read()

    # 3. Validar tamaño
    try:
        validate_file_size(content)
    except ValueError as e:
        raise HTTPException(status_code=413, detail=str(e))

    # 4. Parsear archivo
    try:
        if ext == ".csv":
            X, cell_ids = load_csv(content)
            input_format = "CSV"
        else:
            X, cell_ids = load_h5ad(content)
            input_format = "H5AD"
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # 5. Inferencia
    model_service = request.app.state.model_service
    try:
        predicted_labels, confidences, elapsed = model_service.predict(X)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 6. Construir respuesta
    total = len(predicted_labels)

    summary: dict = {}
    for label in predicted_labels:
        summary[label] = summary.get(label, 0) + 1

    summary_percentage = {
        k: round(v / total * 100, 2) for k, v in summary.items()
    }

    predictions_list = [
        CellPrediction(
            cell_id=cid,
            predicted_class=label,
            confidence=round(conf, 4),
        )
        for cid, label, conf in zip(cell_ids, predicted_labels, confidences)
    ]

    # 7. Guardar en memoria para exportación posterior
    _last_prediction = {
        "cell_ids": cell_ids,
        "predicted_labels": predicted_labels,
        "confidences": confidences,
        "summary": summary,
        "summary_percentage": summary_percentage,
        "total_cells": total,
        "processing_time": elapsed,
    }

    logger.info(
        "Predicción completada: %d células en %.3fs. Distribución: %s",
        total, elapsed, summary,
    )

    return PredictionResponse(
        total_cells=total,
        predictions=predictions_list,
        summary=summary,
        summary_percentage=summary_percentage,
        processing_time_seconds=round(elapsed, 4),
        input_format=input_format,
    )


@router.get(
    "/export/results",
    summary="Descargar resultados como CSV",
    description="Descarga el archivo resultados.csv con las predicciones de la última ejecución.",
)
async def export_results():
    if _last_prediction is None:
        raise HTTPException(
            status_code=404,
            detail="No hay resultados disponibles. Ejecuta una predicción primero.",
        )
    csv_bytes = generate_results_csv(
        _last_prediction["cell_ids"],
        _last_prediction["predicted_labels"],
        _last_prediction["confidences"],
    )
    return StreamingResponse(
        io.BytesIO(csv_bytes),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=resultados.csv"},
    )


@router.get(
    "/export/summary",
    summary="Descargar reporte resumen como CSV",
    description="Descarga reporte_resumen.csv con estadísticas de la última predicción.",
)
async def export_summary():
    if _last_prediction is None:
        raise HTTPException(
            status_code=404,
            detail="No hay resultados disponibles. Ejecuta una predicción primero.",
        )
    csv_bytes = generate_summary_csv(
        _last_prediction["summary"],
        _last_prediction["summary_percentage"],
        _last_prediction["total_cells"],
        _last_prediction["processing_time"],
    )
    return StreamingResponse(
        io.BytesIO(csv_bytes),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reporte_resumen.csv"},
    )
