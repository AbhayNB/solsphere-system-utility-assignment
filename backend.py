"""
Backend Server for System Utility Assignment
- Receives system health data from clients
- Stores machine ID, timestamps, and check results
- Provides APIs for listing/filtering/exporting machine statuses
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import uuid

app = FastAPI()

# In-memory storage for demonstration (replace with DB for production)
machines: Dict[str, dict] = {}

class SystemData(BaseModel):
    os: str
    disk_encryption: dict
    os_update: dict
    antivirus: dict
    sleep_settings: dict
    machine_id: Optional[str] = None
    timestamp: Optional[datetime] = None

@app.post("/report")
def report_system_data(data: SystemData):
    # Assign machine_id if not provided
    machine_id = data.machine_id or str(uuid.uuid4())
    now = datetime.utcnow()
    record = data.dict()
    record['machine_id'] = machine_id
    record['timestamp'] = now
    machines[machine_id] = record
    return {"status": "ok", "machine_id": machine_id, "timestamp": now}

@app.get("/machines")
def list_machines(os: Optional[str] = None, issue: Optional[str] = None):
    results = list(machines.values())
    if os:
        results = [m for m in results if m['os'].lower() == os.lower()]
    if issue:
        # Example: filter by unencrypted disk, outdated OS, etc.
        if issue == 'unencrypted_disk':
            results = [m for m in results if not m['disk_encryption'].get('encrypted')]
        elif issue == 'outdated_os':
            results = [m for m in results if not m['os_update'].get('up_to_date')]
        elif issue == 'no_antivirus':
            results = [m for m in results if not m['antivirus'].get('antivirus_present')]
        elif issue == 'sleep_noncompliant':
            results = [m for m in results if not m['sleep_settings'].get('compliant')]
    return results

@app.get("/machine/{machine_id}")
def get_machine(machine_id: str):
    if machine_id not in machines:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machines[machine_id]

# Optional: CSV export endpoint can be added here

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
