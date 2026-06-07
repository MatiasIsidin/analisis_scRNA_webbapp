@echo off
echo ============================================
echo  Setup inicial del proyecto scRNA-seq
echo ============================================

echo.
echo [1/4] Creando entorno virtual Python...
cd backend
python -m venv venv
call venv\Scripts\activate

echo.
echo [2/4] Instalando dependencias Python...
pip install -r requirements.txt

echo.
echo [3/4] Generando modelos demo (si no existen)...
python scripts/generate_demo_model.py

echo.
echo [4/4] Generando datos de prueba...
python scripts/generate_test_data.py

cd ..

echo.
echo [5/5] Instalando dependencias Node.js...
cd frontend
npm install
cd ..

echo.
echo ============================================
echo  Setup completado!
echo  Ejecuta start.bat para iniciar la app.
echo ============================================
pause
