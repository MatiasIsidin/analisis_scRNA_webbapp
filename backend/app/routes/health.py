"""
Rutas de health check e información del modelo.
"""
from fastapi import APIRouter, Request
from app.schemas.prediction import HealthResponse, ModelInfo

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Verifica que la API está activa y el modelo está cargado.",
)
async def health_check(request: Request):
    model_service = request.app.state.model_service
    return HealthResponse(
        status="ok",
        model_loaded=model_service.is_loaded,
        version="1.0.0",
    )


@router.get(
    "/model-info",
    response_model=ModelInfo,
    summary="Información del modelo",
    description="Retorna metadatos del modelo XGBoost desplegado.",
)
async def model_info(request: Request):
    model_service = request.app.state.model_service
    info = model_service.get_model_info()
    return ModelInfo(
        model=info["model"],
        accuracy=info["accuracy"],
        f1_macro=info["f1_macro"],
        classes=info["classes"],
        n_features=info["n_features"],
        status=info["status"],
        description=info["description"],
    )
