"""
Utilidades para validación de archivos de entrada.
"""
import io
import logging
from typing import Tuple
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# Límite de tamaño: 500 MB
MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024
ALLOWED_EXTENSIONS = {".csv", ".h5ad"}
N_PCA_COMPONENTS = 50


def validate_file_size(content: bytes) -> None:
    """Valida que el archivo no supere el límite de tamaño."""
    if len(content) > MAX_FILE_SIZE_BYTES:
        size_mb = len(content) / (1024 * 1024)
        raise ValueError(
            f"Archivo demasiado grande: {size_mb:.1f} MB. "
            f"Máximo permitido: {MAX_FILE_SIZE_BYTES // (1024*1024)} MB."
        )


def validate_extension(filename: str) -> str:
    """Valida y retorna la extensión del archivo."""
    if not filename:
        raise ValueError("Nombre de archivo vacío.")
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Formato no soportado: '{ext}'. "
            f"Formatos válidos: {', '.join(ALLOWED_EXTENSIONS)}."
        )
    return ext


def load_csv(content: bytes) -> Tuple[np.ndarray, list]:
    """
    Carga un CSV con componentes PCA.
    Espera columnas 'PC1' ... 'PC50' o simplemente las primeras 50 columnas numéricas.
    Retorna (matrix_pca, cell_ids).
    """
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise ValueError(f"No se pudo leer el CSV: {str(e)}")

    if df.empty:
        raise ValueError("El archivo CSV está vacío.")

    # Intentar detectar columnas PCA
    pc_cols = [c for c in df.columns if c.upper().startswith("PC")]
    if len(pc_cols) >= N_PCA_COMPONENTS:
        pc_cols = sorted(pc_cols, key=lambda x: int(x[2:]))[:N_PCA_COMPONENTS]
        X = df[pc_cols].values.astype(np.float32)
        cell_ids = (
            df["cell_id"].astype(str).tolist()
            if "cell_id" in df.columns
            else [f"cell_{i}" for i in range(len(df))]
        )
        return X, cell_ids

    # Fallback: usar columnas numéricas
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if len(numeric_cols) < N_PCA_COMPONENTS:
        raise ValueError(
            f"Dimensiones incompatibles: se encontraron {len(numeric_cols)} columnas numéricas, "
            f"se requieren al menos {N_PCA_COMPONENTS} componentes PCA."
        )

    X = df[numeric_cols[:N_PCA_COMPONENTS]].values.astype(np.float32)
    cell_ids = (
        df["cell_id"].astype(str).tolist()
        if "cell_id" in df.columns
        else [f"cell_{i}" for i in range(len(df))]
    )
    logger.warning(
        "No se encontraron columnas 'PC*'. Usando las primeras %d columnas numéricas.",
        N_PCA_COMPONENTS,
    )
    return X, cell_ids


def load_h5ad(content: bytes) -> Tuple[np.ndarray, list]:
    """
    Carga un archivo H5AD (AnnData).
    Extrae la representación PCA desde adata.obsm['X_pca'].
    """
    try:
        import anndata as ad
        import tempfile, os

        with tempfile.NamedTemporaryFile(suffix=".h5ad", delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        try:
            adata = ad.read_h5ad(tmp_path)
        finally:
            os.unlink(tmp_path)

    except ImportError:
        raise ValueError(
            "La librería 'anndata' no está instalada. "
            "Instálala con: pip install anndata"
        )
    except Exception as e:
        raise ValueError(f"No se pudo leer el archivo H5AD: {str(e)}")

    # Buscar PCA en obsm
    if "X_pca" not in adata.obsm:
        raise ValueError(
            "PCA no encontrado: el archivo H5AD no contiene 'X_pca' en adata.obsm. "
            "Asegúrate de haber calculado el PCA antes de exportar."
        )

    X_pca = adata.obsm["X_pca"]
    if X_pca.shape[1] < N_PCA_COMPONENTS:
        raise ValueError(
            f"Dimensiones incompatibles: el PCA tiene {X_pca.shape[1]} componentes, "
            f"se requieren {N_PCA_COMPONENTS}."
        )

    X = X_pca[:, :N_PCA_COMPONENTS].astype(np.float32)
    cell_ids = adata.obs_names.tolist()
    return X, cell_ids
