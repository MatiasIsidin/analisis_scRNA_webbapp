@echo off
echo ============================================
echo  Clasificador scRNA-seq - Iniciando sistema
echo ============================================

echo.
echo [1/2] Iniciando Backend FastAPI...
start "Backend FastAPI" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Iniciando Frontend React...
start "Frontend React" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo  API Docs: http://localhost:8000/docs
echo ============================================
pause
