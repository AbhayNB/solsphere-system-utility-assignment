#!/bin/bash
# Setup script for Unix-like systems (Linux/macOS)

echo "🚀 Setting up Cross-Platform System Utility + Admin Dashboard"
echo "============================================================"

# Check Python version
python3 --version >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Python 3 is not installed. Please install Python 3.6+ first."
    exit 1
fi

echo "✅ Python 3 found"

# Install dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary files..."

# Create machine_id.txt if it doesn't exist
if [ ! -f "machine_id.txt" ]; then
    python3 -c "import uuid; open('machine_id.txt', 'w').write(str(uuid.uuid4()))"
    echo "✅ Created machine_id.txt"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the backend server:"
echo "   python3 flask_backend_sqlite.py"
echo ""
echo "2. Start the frontend dashboard (in a new terminal):"
echo "   cd frontend && python3 serve.py"
echo ""
echo "3. Run the system utility (in a new terminal, preferably as admin/root):"
echo "   sudo python3 main.py  # Linux/macOS"
echo ""
echo "💡 For full functionality, run the system utility with administrator privileges"
echo "🌐 Dashboard will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:8000"
