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

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Backend Server
```bash
python flask_backend_sqlite.py
```
Server will start on `http://localhost:8000`

### 3. Start the Frontend Dashboard
```bash
cd frontend
python serve.py
```
Dashboard will open at `http://localhost:3000`

### 4. Run System Utility
```bash
# For full functionality, run as administrator/root
python main.py
```

## 📊 Usage

### For Administrators
1. **Start the backend** to collect machine data
2. **Open the dashboard** to view system status
3. **Deploy the utility** on machines you want to monitor
4. **Use filters** to identify machines with issues
5. **Export data** for reporting or analysis

### For System Monitoring
The utility automatically:
- Checks system health every 30 minutes
- Reports only when changes are detected
- Maintains persistent machine identification
- Handles network connectivity issues gracefully

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
