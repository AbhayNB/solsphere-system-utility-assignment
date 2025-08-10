# Cross-Platform System Utility + Admin Dashboard

A comprehensive system health monitoring solution built for the SolSphere assignment. This project consists of three integrated components: a cross-platform system utility, a backend API server, and an admin dashboard.

## 🎯 Project Overview

This system monitors critical security and configuration settings across Windows, Linux, and macOS machines, providing centralized visibility through a modern web dashboard.

### Key Features
- **Cross-platform system health monitoring**
- **Real-time background daemon**
- **Centralized web dashboard**
- **SQLite database storage**
- **Export capabilities (JSON/CSV)**
- **Responsive design**

## 📦 Components

### 1. System Utility (`main.py`)
Cross-platform client that monitors:
- ✅ Disk encryption status (BitLocker/LUKS/FileVault)
- ✅ OS update status
- ✅ Antivirus presence and status
- ✅ Sleep/idle timeout settings (≤10 minutes compliance)

**Features:**
- Runs as background daemon (every 15-60 minutes)
- Only reports changes to minimize network traffic
- Minimal resource consumption
- Administrator privilege detection

### 2. Backend Server (`flask_backend_sqlite.py`)
Flask-based API server with SQLite storage:
- ✅ Receives system data via secure HTTP
- ✅ Stores machine ID, timestamps, check results
- ✅ Provides filtering APIs (OS, issues)
- ✅ Export endpoints (JSON/CSV)

**API Endpoints:**
- `POST /report` - Receive system data
- `GET /machines` - List machines with filtering
- `GET /machine/{id}` - Get specific machine details
- `GET /export/json` - Export data as JSON
- `GET /export/csv` - Export data as CSV

### 3. Admin Dashboard (`frontend/`)
Modern, responsive web interface:
- ✅ Real-time machine status overview
- ✅ Issue flagging and filtering
- ✅ Last check-in timestamps
- ✅ Sortable table and card views
- ✅ Export functionality
- ✅ Auto-refresh capabilities

## 🚀 Quick Start

### Prerequisites
- Python 3.6+
- Administrator/root privileges (recommended for full functionality)
- Internet connection for package installation

### Automated Setup (Recommended)

#### For Windows:
```bash
# Run the setup script
setup.bat
```

#### For Linux/macOS:
```bash
# Make the script executable and run
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 2. Start the Backend Server
Open a terminal/command prompt and run:
```bash
python flask_backend_sqlite.py
```
**✅ Success indicators:**
- You should see: `* Running on http://127.0.0.1:8000`
- Keep this terminal open - the server needs to stay running

#### 3. Start the Frontend Dashboard
Open a **new** terminal/command prompt and run:
```bash
cd frontend
python serve.py
```
**✅ Success indicators:**
- Dashboard opens automatically in your browser at `http://localhost:3000`
- You should see the System Health Dashboard interface

#### 4. Run System Utility (Optional - for live data)
Open a **third** terminal/command prompt and run:
```bash
# Windows (run as Administrator for full functionality)
python main.py

# Linux/macOS (run with sudo for full functionality)
sudo python main.py
```
**✅ Success indicators:**
- You should see: `System Utility Daemon starting...`
- Data will automatically appear in the dashboard within 30 minutes
- Or check the dashboard immediately - test data should already be visible

### ⚡ Quick Test

1. **Verify Backend**: Visit `http://localhost:8000/machines` in your browser
   - Should show JSON data (may be empty initially)

2. **Verify Frontend**: Visit `http://localhost:3000`
   - Should show the dashboard interface
   - May show test data or empty state initially

3. **Add Test Data** (if dashboard is empty):
   ```bash
   python test_backend.py
   ```

## � Detailed Running Instructions

### 🖥️ Running the Complete System

#### Step 1: Prepare Your Environment
```bash
# Clone the repository (if not already done)
git clone https://github.com/AbhayNB/solsphere-system-utility-assignment.git
cd solsphere-system-utility-assignment

# Install dependencies
pip install -r requirements.txt
```

#### Step 2: Start Backend Server (Terminal 1)
```bash
# Navigate to project directory
cd "path/to/assignment 2"

# Start the Flask backend
python flask_backend_sqlite.py
```
**Expected Output:**
```
* Serving Flask app 'flask_backend_sqlite'
* Debug mode: on
* Running on all addresses (0.0.0.0)
* Running on http://127.0.0.1:8000
* Press CTRL+C to quit
```

#### Step 3: Start Frontend Dashboard (Terminal 2)
```bash
# Open a NEW terminal and navigate to frontend
cd "path/to/assignment 2/frontend"

# Start the frontend server
python serve.py
```
**Expected Output:**
```
🚀 Frontend server starting on http://localhost:3000
📁 Serving files from: frontend
🔗 Opening dashboard in your default browser...
```

#### Step 4: Run System Utility (Terminal 3 - Optional)
```bash
# Open a NEW terminal (run as Administrator/sudo for full features)

# Windows (as Administrator)
python main.py

# Linux/macOS (with sudo)
sudo python main.py
```
**Expected Output:**
```
System Utility Daemon starting...
WARNING: For full functionality, run as Administrator (if not already)
```

### 🌐 Accessing the System

1. **Admin Dashboard**: http://localhost:3000
   - Main interface for viewing machine data
   - Real-time updates every 30 seconds
   - Filtering, search, and export features

2. **Backend API**: http://localhost:8000
   - REST API endpoints
   - Visit http://localhost:8000/machines to see raw data

### 🔧 Troubleshooting

#### Backend Won't Start
```bash
# Check if port 8000 is in use
netstat -an | findstr 8000  # Windows
lsof -i :8000              # Linux/macOS

# Kill process if needed, then restart
```

#### Frontend Can't Connect to Backend
```bash
# Verify backend is running
curl http://localhost:8000/machines
# or visit in browser: http://localhost:8000/machines

# Check for CORS errors in browser console
# Ensure flask-cors is installed: pip install flask-cors
```

#### No Data in Dashboard
```bash
# Add test data manually
python test_backend.py

# Or run the system utility to collect real data
python main.py
```

#### Permission Issues (Windows)
```bash
# Run Command Prompt as Administrator
# Right-click cmd.exe -> "Run as administrator"
# Then run: python main.py
```

#### Permission Issues (Linux/macOS)
```bash
# Run with sudo for system-level checks
sudo python main.py

# For BitLocker equivalent checks on Linux
sudo python main.py
```

## 📊 Usage Guide

### 🎯 For System Administrators

#### 1. **Initial Setup**
```bash
# Start all components in order:
# Terminal 1: Backend
python flask_backend_sqlite.py

# Terminal 2: Frontend  
cd frontend && python serve.py

# Terminal 3: System Utility (optional for live data)
python main.py
```

#### 2. **Monitoring Dashboard**
- **Access**: Open http://localhost:3000 in your browser
- **Real-time Updates**: Data refreshes automatically every 30 seconds
- **Manual Refresh**: Click the "Refresh" button anytime

#### 3. **Using Dashboard Features**
- **View Machines**: See all reporting machines in table or card view
- **Filter Data**: Use dropdowns to filter by OS or specific issues
- **Search**: Type machine ID in search box for quick lookup
- **Export Data**: Click Export → JSON/CSV for reports
- **Machine Details**: Click "Details" button for comprehensive info

#### 4. **Deploy on Multiple Machines**
```bash
# Copy these files to each target machine:
# - main.py
# - requirements.txt

# On each machine, run:
pip install -r requirements.txt
python main.py

# All machines will report to the central dashboard
```

### 🔍 For System Monitoring

#### Automated Monitoring
The utility automatically:
- **Checks system health** every 30 minutes (configurable)
- **Reports only changes** to minimize network traffic
- **Maintains persistent machine ID** for consistent tracking
- **Handles network issues** gracefully with retry logic

#### Manual Monitoring
```bash
# Check specific machine status
curl http://localhost:8000/machine/{machine-id}

# Get all machines with issues
curl "http://localhost:8000/machines?issue=unencrypted_disk"

# Export current data
curl http://localhost:8000/export/json > machines.json
```

### 📈 Understanding the Data

#### Health Check Results
- **✅ Green (Pass)**: Security/configuration check passed
- **❌ Red (Fail)**: Issue detected, requires attention  
- **❓ Yellow (Unknown)**: Unable to determine status

#### Common Issues
- **Unencrypted Disk**: BitLocker/FileVault/LUKS not enabled
- **Outdated OS**: System updates available
- **No Antivirus**: No antivirus software detected
- **Sleep Non-compliant**: Sleep timeout > 10 minutes

#### Status Categories
- **🟢 Healthy**: All checks passed
- **🟡 Warning**: Some checks unknown/pending
- **🔴 Critical**: One or more checks failed

## 🔧 Configuration

### Utility Configuration
Edit constants in `main.py`:
```python
def daemon_loop(interval_minutes=30):  # Adjust check interval
    # ...

url = 'http://localhost:8000/report'  # Change backend URL
```

### Backend Configuration
Edit settings in `flask_backend_sqlite.py`:
```python
app.run(host='0.0.0.0', port=8000, debug=True)  # Adjust host/port
```

### Frontend Configuration
Edit settings in `frontend/script.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000';  // Backend URL
const REFRESH_INTERVAL = 30000;  // Auto-refresh interval
```

## 📁 Project Structure

```
├── main.py                     # System utility (client)
├── flask_backend_sqlite.py     # Backend API server
├── backend.py                  # Alternative FastAPI backend
├── requirements.txt            # Python dependencies
├── machines.db                 # SQLite database (auto-created)
├── machines_data.json          # JSON export file
├── machine_id.txt              # Persistent machine ID
└── frontend/
    ├── index.html              # Dashboard HTML
    ├── styles.css              # Responsive CSS
    ├── script.js               # Dashboard JavaScript
    ├── serve.py                # Development server
    └── README.md               # Frontend documentation
```

## 🔍 System Checks Detail

### Disk Encryption
- **Windows**: BitLocker status via PowerShell
- **Linux**: LUKS encrypted partitions via lsblk
- **macOS**: FileVault status via fdesetup

### OS Updates
- **Windows**: Windows Update API (placeholder for production)
- **Linux**: apt package manager update check
- **macOS**: softwareupdate command

### Antivirus Status
- **Windows**: Windows Defender via PowerShell
- **Linux**: ClamAV daemon status
- **macOS**: ClamXAV process detection

### Sleep Settings
- **Windows**: Power scheme timeout via powercfg
- **Linux**: GNOME power settings via gsettings
- **macOS**: Power management via pmset

## 🛡️ Security Considerations

- All HTTP communication should use HTTPS in production
- Consider API authentication for production deployment
- Validate and sanitize all input data
- Run utility with appropriate privileges
- Implement rate limiting for API endpoints

## 🧪 Testing

### Manual Testing
1. Start backend and frontend
2. Run the utility on different OS platforms
3. Verify data appears in dashboard
4. Test filtering and export functionality
5. Check auto-refresh behavior

### Unit Testing
```bash
# Install test dependencies
pip install pytest pytest-flask

# Run tests (when available)
pytest
```

## 📈 Production Deployment

### Backend Deployment
1. Use a production WSGI server (gunicorn, uWSGI)
2. Configure proper database (PostgreSQL, MySQL)
3. Set up HTTPS with proper certificates
4. Implement authentication and authorization
5. Configure logging and monitoring

### Frontend Deployment
1. Serve via nginx or Apache
2. Enable HTTPS
3. Configure CORS properly
4. Optimize assets for production

### Utility Deployment
1. Package as executable using PyInstaller
2. Create installer packages for each OS
3. Set up as system service/daemon
4. Configure automatic updates

## 🤝 Contributing

This project was built for the SolSphere assignment. For improvements:

1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

## 📄 License

This project is part of the SolSphere internship assignment.

## 📞 Support

For questions or issues with this implementation, please refer to:
- Frontend documentation: `frontend/README.md`
- Code comments and docstrings
- Assignment requirements documentation

---

**Assignment Status**: ✅ Complete - All mandatory and optional components implemented
