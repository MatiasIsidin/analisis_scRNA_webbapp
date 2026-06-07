"""
Clasificador Automático de Tipos Celulares scRNA-seq
Backend principal FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.routes import predictions, health
from app.services.model_service import ModelService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Carga el modelo al iniciar la aplicación."""
    logger.info("Iniciando aplicación...")
    model_service = ModelService()
    model_service.load_model()
    app.state.model_service = model_service
    logger.info("Modelo cargado exitosamente.")
    yield
    logger.info("Cerrando aplicación...")


app = FastAPI(
    title="Clasificador de Tipos Celulares scRNA-seq",
    description=(
        "API para clasificación automática de tipos celulares mediante "
        "Machine Learning Multiclase sobre datos de secuenciación de ARN "
        "de célula única (scRNA-seq). Modelo: XGBoost con ~98.9% accuracy."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS para el frontend React en localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(predictions.router, tags=["Predictions"])


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Clasificador de Tipos Celulares scRNA-seq",
        "docs": "/docs",
        "health": "/health",
        "model_info": "/model-info",
    }
