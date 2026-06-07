"""
Script para generar archivos de prueba (CSV y H5AD).

Ejecutar desde backend/:
    python scripts/generate_test_data.py
"""
import os
import numpy as np
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
os.makedirs(DATA_DIR, exist_ok=True)

N_CELLS = 500
N_PCA = 50
CLASSES = ["B", "T", "NK", "MNP", "pDC", "mast"]
np.random.seed(42)

# --- CSV con columnas PC1...PC50 ---
print("Generando test_data.csv...")
data = {"cell_id": [f"cell_{i:05d}" for i in range(N_CELLS)]}
for j in range(1, N_PCA + 1):
    data[f"PC{j}"] = np.random.randn(N_CELLS).astype(np.float32)

df = pd.DataFrame(data)
csv_path = os.path.join(DATA_DIR, "test_data.csv")
df.to_csv(csv_path, index=False)
print(f"  Guardado: {csv_path} ({N_CELLS} células, {N_PCA} componentes PCA)")

# --- H5AD con adata.obsm['X_pca'] ---
try:
    import anndata as ad

    print("Generando test_data.h5ad...")
    X_pca = np.random.randn(N_CELLS, N_PCA).astype(np.float32)
    import scipy.sparse as sp

    raw_expr = sp.random(N_CELLS, 2000, density=0.1, format="csr")
    adata = ad.AnnData(X=raw_expr)
    adata.obs_names = [f"cell_{i:05d}" for i in range(N_CELLS)]
    adata.obsm["X_pca"] = X_pca

    h5ad_path = os.path.join(DATA_DIR, "test_data.h5ad")
    adata.write_h5ad(h5ad_path)
    print(f"  Guardado: {h5ad_path} ({N_CELLS} células)")

except ImportError:
    print("  'anndata' no disponible. Solo se generó el CSV.")

print("\nDatos de prueba generados exitosamente.")
print(f"Directorio: {DATA_DIR}")
