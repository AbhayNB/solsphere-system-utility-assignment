"""
Flask Backend Server for System Utility Assignment (with SQLite persistent storage)
"""
from flask import Flask, request, jsonify, abort, send_file
from flask_cors import CORS
from datetime import datetime
import uuid
import json
import os
import sqlite3

app = Flask(__name__)
CORS(app) 

DB_PATH = 'machines.db'

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS machines (
                machine_id TEXT PRIMARY KEY,
                timestamp TEXT,
                os TEXT,
                disk_encryption TEXT,
                os_update TEXT,
                antivirus TEXT,
                sleep_settings TEXT
            )
        ''')
        conn.commit()
init_db()

def save_machine(record):
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute('''
            INSERT OR REPLACE INTO machines (machine_id, timestamp, os, disk_encryption, os_update, antivirus, sleep_settings)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            record['machine_id'],
            record['timestamp'],
            record['os'],
            json.dumps(record['disk_encryption']),
            json.dumps(record['os_update']),
            json.dumps(record['antivirus']),
            json.dumps(record['sleep_settings'])
        ))
        conn.commit()

def get_all_machines():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute('SELECT * FROM machines')
        rows = c.fetchall()
        machines = []
        for row in rows:
            machines.append({
                'machine_id': row[0],
                'timestamp': row[1],
                'os': row[2],
                'disk_encryption': json.loads(row[3]),
                'os_update': json.loads(row[4]),
                'antivirus': json.loads(row[5]),
                'sleep_settings': json.loads(row[6]),
            })
        return machines

def get_machine_by_id(machine_id):
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute('SELECT * FROM machines WHERE machine_id = ?', (machine_id,))
        row = c.fetchone()
        if not row:
            return None
        return {
            'machine_id': row[0],
            'timestamp': row[1],
            'os': row[2],
            'disk_encryption': json.loads(row[3]),
            'os_update': json.loads(row[4]),
            'antivirus': json.loads(row[5]),
            'sleep_settings': json.loads(row[6]),
        }

@app.route('/report', methods=['POST'])
# Endpoint: Receives system health data from a client utility and stores/updates the latest status for each machine.
def report_system_data():
    data = request.get_json()
    if not data:
        abort(400, description='Invalid JSON')
    machine_id = data.get('machine_id') or str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    record = data.copy()
    record['machine_id'] = machine_id
    record['timestamp'] = now
    save_machine(record)
    # Save all data to a JSON file after each report (optional, for export)
    all_machines = get_all_machines()
    with open('machines_data.json', 'w') as f:
        json.dump({m['machine_id']: m for m in all_machines}, f, indent=2)
    return jsonify({'status': 'ok', 'machine_id': machine_id, 'timestamp': now})

@app.route('/export/json', methods=['GET'])
# Endpoint: Exports all machine data as a JSON file download.
def export_json():
    json_path = 'machines_data.json'
    # Ensure file exists and is up to date
    all_machines = get_all_machines()
    with open(json_path, 'w') as f:
        json.dump({m['machine_id']: m for m in all_machines}, f, indent=2)
    return send_file(json_path, mimetype='application/json', as_attachment=True, download_name='machines_data.json')

@app.route('/export/csv', methods=['GET'])
# Endpoint: Exports all machine data as a CSV file download.
def export_csv():
    import csv
    from io import StringIO
    # Prepare CSV in memory
    si = StringIO()
    fieldnames = [
        'machine_id', 'timestamp', 'os',
        'disk_encryption', 'os_update', 'antivirus', 'sleep_settings'
    ]
    writer = csv.DictWriter(si, fieldnames=fieldnames)
    writer.writeheader()
    for m in get_all_machines():
        row = {
            'machine_id': m.get('machine_id'),
            'timestamp': m.get('timestamp'),
            'os': m.get('os'),
            'disk_encryption': str(m.get('disk_encryption')),
            'os_update': str(m.get('os_update')),
            'antivirus': str(m.get('antivirus')),
            'sleep_settings': str(m.get('sleep_settings')),
        }
        writer.writerow(row)
    si.seek(0)
    return app.response_class(
        si.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment;filename=machines_data.csv'}
    )

@app.route('/machines', methods=['GET'])
# Endpoint: Lists all reporting machines and their latest status. Supports filtering by OS and issue type via query params.
def list_machines():
    os_filter = request.args.get('os')
    issue = request.args.get('issue')
    results = get_all_machines()
    if os_filter:
        results = [m for m in results if m.get('os', '').lower() == os_filter.lower()]
    if issue:
        if issue == 'unencrypted_disk':
            results = [m for m in results if not m.get('disk_encryption', {}).get('encrypted')]
        elif issue == 'outdated_os':
            results = [m for m in results if not m.get('os_update', {}).get('up_to_date')]
        elif issue == 'no_antivirus':
            results = [m for m in results if not m.get('antivirus', {}).get('antivirus_present')]
        elif issue == 'sleep_noncompliant':
            results = [m for m in results if not m.get('sleep_settings', {}).get('compliant')]
    return jsonify(results)

@app.route('/machine/<machine_id>', methods=['GET'])
# Endpoint: Returns the latest status/details for a specific machine by its machine_id.
def get_machine(machine_id):
    machine = get_machine_by_id(machine_id)
    if not machine:
        abort(404, description='Machine not found')
    return jsonify(machine)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
