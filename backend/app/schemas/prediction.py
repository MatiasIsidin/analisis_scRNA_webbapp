"""
Esquemas Pydantic para validación de requests y responses.
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional


class CellPrediction(BaseModel):
    """Predicción individual por célula."""
    cell_id: str = Field(..., description="Identificador único de la célula")
    predicted_class: str = Field(..., description="Tipo celular predicho")
    confidence: Optional[float] = Field(
        None, description="Probabilidad máxima asignada por el modelo"
    )


class ClassSummary(BaseModel):
    """Resumen de conteos por clase."""
    class_name: str
    count: int
    percentage: float


class PredictionResponse(BaseModel):
    """Respuesta completa de predicción."""
    total_cells: int = Field(..., description="Total de células procesadas")
    predictions: List[CellPrediction] = Field(
        ..., description="Lista de predicciones individuales"
    )
    summary: Dict[str, int] = Field(
        ..., description="Conteo de células por tipo celular"
    )
    summary_percentage: Dict[str, float] = Field(
        ..., description="Porcentaje de células por tipo celular"
    )
    processing_time_seconds: float = Field(
        ..., description="Tiempo de procesamiento en segundos"
    )
    input_format: str = Field(..., description="Formato del archivo de entrada")


class ModelInfo(BaseModel):
    """Información del modelo desplegado."""
    model: str = Field(default="XGBoost", description="Tipo de modelo")
    accuracy: float = Field(default=0.989, description="Accuracy en test set")
    f1_macro: float = Field(default=0.97, description="F1 Macro score")
    classes: List[str] = Field(..., description="Clases que puede predecir el modelo")
    n_features: int = Field(..., description="Número de features (componentes PCA)")
    status: str = Field(default="loaded", description="Estado del modelo")
    description: str = Field(
        default="Clasificador XGBoost entrenado sobre 328.170 células con 2000 genes altamente variables.",
        description="Descripción del modelo"
    )


class HealthResponse(BaseModel):
    """Respuesta del endpoint de salud."""
    status: str = Field(default="ok")
    model_loaded: bool
    version: str = Field(default="1.0.0")


class ErrorResponse(BaseModel):
    """Respuesta de error estándar."""
    error: str
    detail: str
    status_code: int
