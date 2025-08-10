# System Health Dashboard - Frontend

A modern, responsive admin dashboard for monitoring system health data from multiple machines.

## 🌟 Features

### 📊 Dashboard Overview
- **Real-time Statistics**: Total machines, issue count, healthy systems, and last update time
- **Auto-refresh**: Automatically updates every 30 seconds
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 🔍 Filtering & Search
- **OS Filter**: Filter by Windows, Linux, or macOS
- **Issue Filter**: Filter by specific issues (unencrypted disk, outdated OS, no antivirus, sleep non-compliant)
- **Search**: Search machines by machine ID
- **Clear Filters**: Reset all filters with one click

### 📋 Data Views
- **Table View**: Detailed tabular view with sortable columns
- **Card View**: Visual card-based layout for easier scanning
- **Toggle Views**: Switch between table and card views instantly

### 📱 Machine Management
- **Machine Details**: Click to view detailed information about any machine
- **Status Indicators**: Visual status badges (Healthy, Warning, Critical)
- **Check Results**: Clear pass/fail indicators for all security checks
- **Raw Data**: Access to complete machine data in JSON format

### 📤 Export Options
- **JSON Export**: Download all machine data as JSON
- **CSV Export**: Download all machine data as CSV for spreadsheet analysis

### 🎨 User Experience
- **Modern Design**: Clean, professional interface with gradients and shadows
- **Smooth Animations**: Subtle animations for better user experience
- **Loading States**: Clear loading indicators during data fetching
- **Error Handling**: Graceful error handling with retry options
- **Keyboard Navigation**: Press Escape to close modals

## 🚀 Getting Started

### Prerequisites
- Python 3.6+ (for the development server)
- Backend API running on `http://localhost:8000`

### Quick Start

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Start the development server**:
   ```bash
   python serve.py
   ```

3. **Open your browser**:
   The dashboard will automatically open at `http://localhost:3000`

### Manual Setup (Alternative)

If you prefer to use your own web server:

1. Serve the files from the `frontend` directory using any HTTP server
2. Ensure CORS is enabled if the backend is on a different port
3. Update the `API_BASE_URL` in `script.js` if needed

## 🔧 Configuration

### API Configuration
Edit the `API_BASE_URL` constant in `script.js` to point to your backend:

```javascript
const API_BASE_URL = 'http://localhost:8000';  // Change this if needed
```

### Refresh Interval
Adjust the auto-refresh interval by changing the `REFRESH_INTERVAL` constant:

```javascript
const REFRESH_INTERVAL = 30000; // 30 seconds (in milliseconds)
```

## 📁 File Structure

```
frontend/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript application logic
├── serve.py            # Development server
└── README.md           # This file
```

## 🎯 Backend API Requirements

The frontend expects the following API endpoints:

### GET /machines
Returns list of all machines with optional filtering:
- Query params: `os`, `issue`
- Response: Array of machine objects

### GET /machine/{machine_id}
Returns detailed information for a specific machine:
- Response: Single machine object

### GET /export/json
Downloads all machine data as JSON file

### GET /export/csv
Downloads all machine data as CSV file

## 🔍 Machine Data Format

Each machine object should contain:

```json
{
  "machine_id": "unique-machine-id",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "os": "Windows|Linux|Darwin",
  "disk_encryption": {
    "encrypted": true|false|null,
    "details": "Additional information"
  },
  "os_update": {
    "up_to_date": true|false|null,
    "details": "Additional information"
  },
  "antivirus": {
    "antivirus_present": true|false|null,
    "status": "Additional information"
  },
  "sleep_settings": {
    "compliant": true|false|null,
    "sleep_timeout_minutes": 10,
    "details": "Additional information"
  }
}
```

## 🎨 Customization

### Styling
All styles are in `styles.css`. The design uses:
- CSS Grid and Flexbox for layout
- CSS Custom Properties for consistent theming
- Responsive breakpoints for mobile compatibility

### Colors
The dashboard uses a modern color palette:
- Primary: Blue gradient (#667eea to #764ba2)
- Success: Green (#51cf66)
- Warning: Orange (#ffd43b)
- Error: Red (#ff6b6b)

### Icons
Uses Font Awesome 6.0 for all icons. You can customize icons by changing the icon classes in the JavaScript code.

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Make sure your backend allows CORS from the frontend origin
   - Use the provided `serve.py` script which handles CORS

2. **API Connection Failed**:
   - Verify the backend is running on the correct port
   - Check the `API_BASE_URL` in `script.js`
   - Check browser console for network errors

3. **No Data Showing**:
   - Ensure machines are reporting to the backend
   - Check the backend `/machines` endpoint directly
   - Look for JavaScript errors in browser console

4. **Export Not Working**:
   - Verify the backend has `/export/json` and `/export/csv` endpoints
   - Check if browser is blocking file downloads

### Browser Support
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 📝 Development Notes

### Performance Considerations
- Data is cached and only re-fetched when needed
- Auto-refresh pauses when the tab is not visible
- Large datasets are handled with virtual scrolling (if needed)

### Security
- All data is sanitized before rendering
- XSS protection through proper escaping
- HTTPS recommended for production

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios

## 🤝 Contributing

To contribute to the frontend:

1. Follow the existing code style
2. Test on multiple browsers
3. Ensure responsive design works
4. Add appropriate comments
5. Update documentation as needed

## 📄 License

This project is part of the SolSphere assignment and follows the same licensing terms as the main project.
