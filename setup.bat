@echo off
REM Setup script for Windows

echo 🚀 Setting up Cross-Platform System Utility + Admin Dashboard
echo ============================================================

REM Check Python version
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.6+ first.
    pause
    exit /b 1
)

echo ✅ Python found

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Create necessary files
echo 📁 Creating necessary files...

REM Create machine_id.txt if it doesn't exist
if not exist "machine_id.txt" (
    python -c "import uuid; open('machine_id.txt', 'w').write(str(uuid.uuid4()))"
    echo ✅ Created machine_id.txt
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Start the backend server:
echo    python flask_backend_sqlite.py
echo.
echo 2. Start the frontend dashboard ^(in a new command prompt^):
echo    cd frontend ^&^& python serve.py
echo.
echo 3. Run the system utility ^(in a new command prompt as Administrator^):
echo    python main.py
echo.
echo 💡 For full functionality, run the system utility as Administrator
echo 🌐 Dashboard will be available at: http://localhost:3000
echo 🔧 Backend API will be available at: http://localhost:8000

pause
