import urllib.request, urllib.parse, time, json, os, email.generator, io

def multipart_post(url, filepath):
    boundary = "----PythonBenchBoundary"
    fname = os.path.basename(filepath)
    with open(filepath, "rb") as f:
        file_data = f.read()
    
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{fname}"\r\n'
        f"Content-Type: text/csv\r\n\r\n"
    ).encode() + file_data + f"\r\n--{boundary}--\r\n".encode()
    
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode())
    t1 = time.time()
    return data, t1 - t0, resp.status

files_to_test = [
    "test_small_20cells.csv",
    "test_medium_5000cells.csv",
]

for fname in files_to_test:
    data, elapsed, status = multipart_post("http://localhost:8000/predict", fname)
    pt = data["processing_time_seconds"]
    total = data["total_cells"]
    print(f"[{fname}] Status={status} | Cells={total} | Inferencia={pt:.4f}s | HTTP_total={elapsed:.3f}s")
