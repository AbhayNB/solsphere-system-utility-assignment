import requests
import json

# Test data to send to the backend
test_data = {
    "os": "Windows",
    "disk_encryption": {
        "encrypted": True,
        "details": "BitLocker enabled"
    },
    "os_update": {
        "up_to_date": False,
        "details": "Updates available"
    },
    "antivirus": {
        "antivirus_present": True,
        "status": "Windows Defender active"
    },
    "sleep_settings": {
        "compliant": True,
        "sleep_timeout_minutes": 10,
        "details": "Sleep timeout is 10 minutes"
    }
}

try:
    # Send test data to backend
    response = requests.post('http://localhost:8000/report', json=test_data)
    print(f"POST /report - Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test getting machines
    response = requests.get('http://localhost:8000/machines')
    print(f"\nGET /machines - Status: {response.status_code}")
    machines = response.json()
    print(f"Number of machines: {len(machines)}")
    if machines:
        print(f"First machine ID: {machines[0]['machine_id']}")
        
except Exception as e:
    print(f"Error: {e}")
