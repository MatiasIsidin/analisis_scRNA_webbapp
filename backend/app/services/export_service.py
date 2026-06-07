"""
Servicio de exportación: genera archivos CSV para descarga.
"""
import io
import csv
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


def generate_results_csv(
    cell_ids: List[str],
    predicted_labels: List[str],
    confidences: List[float],
) -> bytes:
    """
    Genera un CSV con los resultados de predicción.
    Columnas: cell_id, predicted_class, confidence
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["cell_id", "predicted_class", "confidence"])
    for cid, label, conf in zip(cell_ids, predicted_labels, confidences):
        writer.writerow([cid, label, f"{conf:.4f}"])
    return output.getvalue().encode("utf-8")


def generate_summary_csv(
    summary: Dict[str, int],
    summary_percentage: Dict[str, float],
    total_cells: int,
    processing_time: float,
    accuracy: float = 0.989,
) -> bytes:
    """
    Genera un CSV con el resumen estadístico.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Encabezado del reporte
    writer.writerow(["=== REPORTE DE CLASIFICACIÓN scRNA-seq ==="])
    writer.writerow([])
    writer.writerow(["Modelo", "XGBoost"])
    writer.writerow(["Accuracy del Modelo", f"{accuracy*100:.1f}%"])
    writer.writerow(["Total de Células Procesadas", total_cells])
    writer.writerow(["Tiempo de Procesamiento (s)", f"{processing_time:.3f}"])
    writer.writerow([])

    # Tabla de distribución
    writer.writerow(["Tipo Celular", "Cantidad", "Porcentaje (%)"])
    for class_name in sorted(summary.keys()):
        count = summary[class_name]
        pct = summary_percentage.get(class_name, 0.0)
        writer.writerow([class_name, count, f"{pct:.2f}"])

    writer.writerow([])
    writer.writerow(["TOTAL", total_cells, "100.00"])

    return output.getvalue().encode("utf-8")
