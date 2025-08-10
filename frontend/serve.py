#!/usr/bin/env python3
"""
Simple HTTP server to serve the frontend dashboard
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

PORT = 3000
FRONTEND_DIR = Path(__file__).parent

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to frontend directory
    os.chdir(FRONTEND_DIR)
    
    try:
        with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
            print(f"🚀 Frontend server starting on http://localhost:{PORT}")
            print(f"📁 Serving files from: {FRONTEND_DIR}")
            print(f"🔗 Opening dashboard in your default browser...")
            print(f"\n💡 Make sure your backend is running on http://localhost:8000")
            print(f"   You can start it with: python flask_backend.py")
            print(f"\n⏹️  Press Ctrl+C to stop the server")
            
            # Open browser
            webbrowser.open(f'http://localhost:{PORT}')
            
            # Start server
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use. Try a different port or stop the existing server.")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
