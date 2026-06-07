"""
Prueba todos los endpoints de la API y muestra las respuestas reales.
"""
import urllib.request
import urllib.parse
import json
import os
import sys
import time

BASE = "http://localhost:8000"

def get(path):
    try:
        r = urllib.request.urlopen(BASE + path, timeout=10)
        return json.loads(r.read())
    except Exception as e:
        return {"ERROR": str(e)}

def separator(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

# ── GET / ──────────────────────────────────────────────────────
separator("GET /")
data = get("/")
print(json.dumps(data, indent=2, ensure_ascii=False))

# ── GET /health ────────────────────────────────────────────────
separator("GET /health")
data = get("/health")
print(json.dumps(data, indent=2, ensure_ascii=False))

# ── GET /model-info ────────────────────────────────────────────
separator("GET /model-info")
data = get("/model-info")
print(json.dumps(data, indent=2, ensure_ascii=False))

# ── POST /predict (CSV sintético) ─────────────────────────────
separator("POST /predict  —  generando CSV de prueba (20 células)")

import numpy as np

np.random.seed(7)
n = 20
header = "cell_id," + ",".join(f"PC{i}" for i in range(1, 51))
rows = [header]
for i in range(n):
    vals = ",".join(f"{v:.6f}" for v in np.random.randn(50).astype(float))
    rows.append(f"cell_{i:04d}," + vals)
csv_content = "\n".join(rows).encode("utf-8")

import urllib.request as req
boundary = "----FormBoundary7MA4YWxkTrZu0gW"
body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="test_20cells.csv"\r\n'
    f"Content-Type: text/csv\r\n\r\n"
).encode("utf-8") + csv_content + f"\r\n--{boundary}--\r\n".encode("utf-8")

request = urllib.request.Request(
    BASE + "/predict",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    method="POST"
)
try:
    start = time.time()
    response = urllib.request.urlopen(request, timeout=30)
    elapsed = time.time() - start
    result = json.loads(response.read())
    print(f"HTTP 200 OK — Tiempo total: {elapsed:.3f}s")
    print(json.dumps(result, indent=2, ensure_ascii=False))
except urllib.error.HTTPError as e:
    body_err = e.read().decode()
    print(f"HTTP {e.code}: {body_err}")
except Exception as e:
    print(f"ERROR: {e}")

# ── GET /export/results ────────────────────────────────────────
separator("GET /export/results  —  primeras 5 líneas del CSV")
try:
    r = urllib.request.urlopen(BASE + "/export/results", timeout=10)
    content = r.read().decode("utf-8")
    lines = content.strip().split("\n")
    for line in lines[:6]:
        print(line)
    print(f"  ... ({len(lines)-1} filas de datos)")
except Exception as e:
    print(f"ERROR: {e}")

# ── GET /export/summary ────────────────────────────────────────
separator("GET /export/summary  —  contenido completo del reporte")
try:
    r = urllib.request.urlopen(BASE + "/export/summary", timeout=10)
    content = r.read().decode("utf-8")
    print(content.strip())
except Exception as e:
    print(f"ERROR: {e}")

print("\n" + "=" * 60)
print("  PRUEBA COMPLETA FINALIZADA")
print("=" * 60)
