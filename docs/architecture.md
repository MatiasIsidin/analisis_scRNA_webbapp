# Arquitectura del Sistema — Clasificador scRNA-seq

## Diagrama de flujo completo

```mermaid
sequenceDiagram
    actor User as Investigador
    participant FE as Frontend React
    participant API as FastAPI Backend
    participant SVC as ModelService
    participant XGB as XGBoost Model
    participant LE as LabelEncoder

    User->>FE: Abre http://localhost:5173
    FE->>API: GET /health
    API-->>FE: { status: "ok", model_loaded: true }
    FE->>API: GET /model-info
    API-->>FE: { model, accuracy, classes, ... }
    FE-->>User: Muestra estado del modelo

    User->>FE: Selecciona archivo .csv o .h5ad
    FE-->>User: Validación formato/tamaño
    User->>FE: Click "Ejecutar Clasificación"
    FE->>API: POST /predict (multipart/form-data)

    API->>API: validate_extension()
    API->>API: validate_file_size()
    API->>API: load_csv() / load_h5ad()
    API->>SVC: predict(X_pca)
    SVC->>XGB: model.predict(X)
    XGB-->>SVC: raw_predictions
    SVC->>XGB: model.predict_proba(X)
    XGB-->>SVC: probabilities
    SVC->>LE: inverse_transform(preds)
    LE-->>SVC: cell_type_labels
    SVC-->>API: (labels, confidences, elapsed)
    API-->>FE: PredictionResponse JSON

    FE-->>User: Tabla + Gráficos + Resumen
    User->>FE: Click "Descargar CSV"
    FE->>API: GET /export/results
    API-->>FE: resultados.csv (StreamingResponse)
    FE-->>User: Descarga archivo
```

## Capas del sistema

```
┌─────────────────────────────────────────────────────┐
│                  CAPA DE PRESENTACIÓN                │
│  React 18 + TypeScript + Vite + Tailwind CSS        │
│  Recharts (visualizaciones) · Lucide (iconos)        │
├─────────────────────────────────────────────────────┤
│                  CAPA DE COMUNICACIÓN                │
│  REST API · JSON · Axios · CORS                      │
├─────────────────────────────────────────────────────┤
│                  CAPA DE API                         │
│  FastAPI 0.111 · Pydantic v2 · Uvicorn               │
│  Endpoints: /health /model-info /predict /export/*   │
├─────────────────────────────────────────────────────┤
│                  CAPA DE SERVICIOS                   │
│  ModelService · FileValidator · ExportService        │
├─────────────────────────────────────────────────────┤
│                  CAPA DE MODELO ML                   │
│  XGBoost · scikit-learn LabelEncoder                 │
│  50 componentes PCA · 6 clases celulares             │
└─────────────────────────────────────────────────────┘
```

## Decisiones de diseño

| Decisión | Justificación |
|----------|--------------|
| FastAPI | Performance, tipado automático, Swagger nativo |
| Pydantic v2 | Validación robusta de schemas |
| Lifespan context | Carga del modelo una sola vez al inicio |
| Modo demo | Permite probar la UI sin el modelo real |
| Streaming CSV | Evita memory overflow en datasets grandes |
| PCA-only input | Reduce dimensionalidad: 2000 genes → 50 features |
| Paginación tabla | Soporta datasets de cientos de miles de células |
