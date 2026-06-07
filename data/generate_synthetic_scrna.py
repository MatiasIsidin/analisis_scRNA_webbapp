"""
Generador de dataset sintético de scRNA-seq para clasificación multiclase.
Simula espacio PCA de 50 dimensiones con 6 tipos celulares y desbalance biológico realista.
"""

import numpy as np
import pandas as pd
from pathlib import Path

# ─── Configuración ────────────────────────────────────────────────────────────
SEED        = 42
N_SAMPLES   = 328_170
N_FEATURES  = 50
OUTPUT_FILE = Path(__file__).parent / "processed" / "synthetic_scRNA_pca.csv"

# Clases y distribución biológica realista
CLASSES = ["T", "B", "NK", "MNP", "mast", "pDC"]
PROPORTIONS = {
    "T":   0.30,
    "B":   0.35,
    "NK":  0.15,
    "MNP": 0.10,
    "mast":0.06,
    "pDC": 0.04,
}

np.random.seed(SEED)

# ─── Parámetros por clase ──────────────────────────────────────────────────────
# Cada clase tiene: media desplazada + varianza propia por componente
# Los vectores de media están separados en el espacio latente pero con solapamiento
CLASS_PARAMS = {
    "T": {
        "mean_shift":  np.concatenate([
            np.random.uniform(2.5, 4.0, 10),    # primeras PCs: señal fuerte
            np.random.uniform(-1.0, 1.0, 20),   # PCs medias: solapamiento
            np.zeros(20),                        # PCs bajas: ruido
        ]),
        "std_scale": 1.0,
    },
    "B": {
        "mean_shift": np.concatenate([
            np.random.uniform(-4.0, -2.5, 10),
            np.random.uniform(-1.5, 1.5, 20),
            np.zeros(20),
        ]),
        "std_scale": 1.1,
    },
    "NK": {
        "mean_shift": np.concatenate([
            np.random.uniform(1.0, 2.5, 10),
            np.random.uniform(2.0, 4.0, 10),
            np.random.uniform(-1.0, 1.0, 10),
            np.zeros(20),
        ]),
        "std_scale": 0.9,
    },
    "MNP": {
        "mean_shift": np.concatenate([
            np.random.uniform(-2.0, -0.5, 10),
            np.random.uniform(-4.0, -2.0, 10),
            np.random.uniform(-1.0, 1.0, 10),
            np.zeros(20),
        ]),
        "std_scale": 1.3,
    },
    "mast": {
        "mean_shift": np.concatenate([
            np.random.uniform(0.5, 2.0, 5),
            np.random.uniform(-2.0, 0.5, 5),
            np.random.uniform(3.0, 5.0, 10),
            np.random.uniform(-1.0, 1.0, 10),
            np.zeros(20),
        ]),
        "std_scale": 0.8,
    },
    "pDC": {
        "mean_shift": np.concatenate([
            np.random.uniform(-1.5, 0.0, 5),
            np.random.uniform(0.0, 1.5, 5),
            np.random.uniform(-5.0, -3.0, 10),
            np.random.uniform(-1.0, 1.0, 10),
            np.zeros(20),
        ]),
        "std_scale": 0.75,
    },
}

# Varianzas base por PC (decrecientes, simulando PCA real: PC1 > PC2 > ... > PC50)
base_variance = np.array([
    max(0.5, 3.0 * np.exp(-0.05 * i) + np.random.uniform(0.0, 0.3))
    for i in range(N_FEATURES)
])

# ─── Generación de datos ───────────────────────────────────────────────────────
print("=" * 55)
print("  Generando dataset sintético scRNA-seq PCA")
print("=" * 55)
print(f"  Muestras:  {N_SAMPLES:,}")
print(f"  Features:  {N_FEATURES} (PC1 … PC{N_FEATURES})")
print(f"  Clases:    {CLASSES}")
print()

all_X = []
all_y = []

for cls in CLASSES:
    n_cls  = int(round(PROPORTIONS[cls] * N_SAMPLES))
    params = CLASS_PARAMS[cls]
    scale  = params["std_scale"]

    # Varianza por componente: base * escala_clase + ruido pequeño por componente
    per_component_std = (
        base_variance * scale
        + np.random.uniform(0.0, 0.15, N_FEATURES)
    )

    # Muestra multivariada: diagonal → columnas independientes
    X_cls = np.random.normal(
        loc   = params["mean_shift"],
        scale = per_component_std,
        size  = (n_cls, N_FEATURES),
    ).astype(np.float32)

    all_X.append(X_cls)
    all_y.extend([cls] * n_cls)
    print(f"  {cls:5s}  →  {n_cls:7,} células  ({PROPORTIONS[cls]*100:.0f}%)")

# Concatenar y mezclar aleatoriamente
X = np.vstack(all_X)
y = np.array(all_y)

shuffle_idx = np.random.permutation(len(y))
X = X[shuffle_idx]
y = y[shuffle_idx]

# Ajuste fino: el redondeo puede dejar N != 328170
actual_n = len(y)
if actual_n != N_SAMPLES:
    X = X[:N_SAMPLES]
    y = y[:N_SAMPLES]

# ─── Construir DataFrame ───────────────────────────────────────────────────────
feature_cols = [f"PC{i}" for i in range(1, N_FEATURES + 1)]
df = pd.DataFrame(X, columns=feature_cols)
df["label"] = y

# ─── Guardar ──────────────────────────────────────────────────────────────────
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
df.to_csv(OUTPUT_FILE, index=False)

# ─── Reporte final ────────────────────────────────────────────────────────────
print()
print("=" * 55)
print("  DATASET GENERADO")
print("=" * 55)
print(f"  Shape:   {df.shape}")
print(f"  Archivo: {OUTPUT_FILE}")
print()
print("  Distribución de clases:")
counts = df["label"].value_counts().reindex(CLASSES)
for cls, cnt in counts.items():
    pct = cnt / len(df) * 100
    bar = "█" * int(pct / 1.5)
    print(f"    {cls:5s}  {cnt:7,}  ({pct:5.2f}%)  {bar}")

print()
print("  Estadísticas de features (primeras 3 PCs):")
print(df[["PC1","PC2","PC3"]].describe().round(4).to_string())
print()
print("  Verificación de calidad:")
print(f"    Valores nulos:   {df.isnull().sum().sum()}")
print(f"    Duplicados:      {df.duplicated().sum()}")
pc_cols = [c for c in df.columns if c.startswith("PC")]
print(f"    Rango PC1:       [{df['PC1'].min():.3f},  {df['PC1'].max():.3f}]")
print(f"    Rango PC50:      [{df['PC50'].min():.3f},  {df['PC50'].max():.3f}]")
print()
print("  Dataset listo para entrenamiento. ✓")
print("=" * 55)
