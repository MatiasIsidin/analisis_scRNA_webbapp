"""
Script para generar modelos demo cuando no se tienen los artefactos reales.
Útil para pruebas de integración sin el modelo entrenado.

Ejecutar desde backend/:
    python scripts/generate_demo_model.py
"""
import os
import pickle
import numpy as np
from sklearn.preprocessing import LabelEncoder

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

CLASSES = ["B", "T", "NK", "MNP", "pDC", "mast"]

# Generar LabelEncoder
le = LabelEncoder()
le.fit(CLASSES)
encoder_path = os.path.join(MODELS_DIR, "label_encoder.pkl")
with open(encoder_path, "wb") as f:
    pickle.dump(le, f)
print(f"LabelEncoder guardado en: {encoder_path}")
print(f"Clases: {list(le.classes_)}")

# Generar modelo XGBoost de demo
try:
    from xgboost import XGBClassifier

    print("\nEntrenando modelo XGBoost demo con datos sintéticos...")
    np.random.seed(42)
    n_samples = 5000
    n_features = 50
    weights = [0.30, 0.40, 0.12, 0.10, 0.05, 0.03]
    y_labels = np.random.choice(CLASSES, size=n_samples, p=weights)
    y = le.transform(y_labels)
    X = np.random.randn(n_samples, n_features).astype(np.float32)
    # Añadir señal artificial por clase
    for i, cls in enumerate(CLASSES):
        mask = y == i
        X[mask, i % n_features] += 3.0

    model = XGBClassifier(
        n_estimators=50,
        max_depth=4,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X, y)

    model_path = os.path.join(MODELS_DIR, "xgboost_best_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    print(f"Modelo XGBoost demo guardado en: {model_path}")

    # Verificar
    sample = np.random.randn(10, 50).astype(np.float32)
    preds = model.predict(sample)
    decoded = le.inverse_transform(preds)
    print(f"Predicciones de prueba: {list(decoded)}")
    print("\nModelos demo generados exitosamente.")

except ImportError:
    print("XGBoost no instalado. Solo se generó el LabelEncoder.")
    print("Instala con: pip install xgboost")
