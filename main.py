import ctypes
"""
Cross-Platform System Utility
- Collects system health data
- Runs as a background daemon
- Sends updates to remote API endpoint
"""

import time
import platform
import threading
import subprocess
import re
import sys

def is_admin():
    if platform.system() == 'Windows':
        try:
            return ctypes.windll.shell32.IsUserAnAdmin() != 0
        except Exception:
            return False
    return False

def check_disk_encryption():
    system = platform.system()
    if system == 'Windows':
        if not is_admin():
            return {'encrypted': None, 'details': 'Administrator privileges required to check BitLocker status.'}
        try:
            output = subprocess.check_output(
                ['powershell', '-Command', 'Get-BitLockerVolume | Select-Object -Property VolumeStatus'],
                stderr=subprocess.STDOUT, text=True)
            encrypted = 'FullyEncrypted' in output
            return {'encrypted': encrypted, 'details': output.strip()}
        except Exception as e:
            return {'encrypted': None, 'details': str(e)}
    elif system == 'Linux':
        try:
            # Check for LUKS encrypted partitions
            output = subprocess.check_output(['lsblk', '-o', 'NAME,TYPE,MOUNTPOINT'], text=True)
            crypt_output = subprocess.check_output(['lsblk', '-o', 'NAME,TYPE'], text=True)
            encrypted = 'crypt' in crypt_output
            return {'encrypted': encrypted, 'details': crypt_output.strip()}
        except Exception as e:
            return {'encrypted': None, 'details': str(e)}
    elif system == 'Darwin':
        try:
            # Check FileVault status
            output = subprocess.check_output(['fdesetup', 'status'], text=True)
            encrypted = 'On' in output
            return {'encrypted': encrypted, 'details': output.strip()}
        except Exception as e:
            return {'encrypted': None, 'details': str(e)}
    return {'encrypted': None, 'details': 'Not implemented'}

def check_os_update_status():
    system = platform.system()
    if system == 'Windows':
        try:
            # Placeholder for Windows Update check
            return {'up_to_date': None, 'details': 'Check with Windows Update API for production'}
        except Exception as e:
            return {'up_to_date': None, 'details': str(e)}
    elif system == 'Linux':
        try:
            # Check for available updates (Debian/Ubuntu)
            output = subprocess.check_output(['apt', 'list', '--upgradable'], text=True, stderr=subprocess.DEVNULL)
            up_to_date = 'upgradable' not in output
            return {'up_to_date': up_to_date, 'details': output.strip()}
        except Exception as e:
            return {'up_to_date': None, 'details': str(e)}
    elif system == 'Darwin':
        try:
            output = subprocess.check_output(['softwareupdate', '-l'], text=True)
            up_to_date = 'No new software available.' in output
            return {'up_to_date': up_to_date, 'details': output.strip()}
        except Exception as e:
            return {'up_to_date': None, 'details': str(e)}
    return {'up_to_date': None, 'details': 'Not implemented'}

def check_antivirus_status():
    system = platform.system()
    if system == 'Windows':
        try:
            output = subprocess.check_output(
                ['powershell', '-Command', 'Get-MpComputerStatus | Select-Object -Property AMServiceEnabled,AntivirusEnabled,RealTimeProtectionEnabled,AntivirusSignatureLastUpdated'],
                stderr=subprocess.STDOUT, text=True)
            present = 'True' in output
            return {'antivirus_present': present, 'status': output.strip()}
        except Exception as e:
            return {'antivirus_present': None, 'status': str(e)}
    elif system == 'Linux':
        try:
            # Check for ClamAV as a common open-source AV
            output = subprocess.check_output(['systemctl', 'is-active', 'clamav-daemon'], text=True)
            present = 'active' in output
            return {'antivirus_present': present, 'status': output.strip()}
        except Exception as e:
            return {'antivirus_present': False, 'status': str(e)}
    elif system == 'Darwin':
        # No built-in AV, check for common AV process (e.g., ClamXAV)
        try:
            output = subprocess.check_output(['pgrep', 'ClamXAV'], text=True)
            present = bool(output.strip())
            return {'antivirus_present': present, 'status': 'ClamXAV running' if present else 'Not running'}
        except Exception as e:
            return {'antivirus_present': False, 'status': str(e)}
    return {'antivirus_present': None, 'status': 'Not implemented'}

def check_sleep_settings():
    system = platform.system()
    if system == 'Windows':
        try:
            output = subprocess.check_output(
                ['powershell', '-Command', 'powercfg -query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE'],
                stderr=subprocess.STDOUT, text=True)
            match = re.search(r'Power Setting Index: (\d+)', output)
            minutes = int(match.group(1)) // 60 if match else None
            compliant = minutes is not None and minutes <= 10
            return {'sleep_timeout_minutes': minutes, 'compliant': compliant, 'details': output.strip()}
        except Exception as e:
            return {'sleep_timeout_minutes': None, 'compliant': None, 'details': str(e)}
    elif system == 'Linux':
        try:
            # Check sleep timeout (AC) using gsettings (GNOME)
            output = subprocess.check_output(['gsettings', 'get', 'org.gnome.settings-daemon.plugins.power', 'sleep-inactive-ac-timeout'], text=True)
            seconds = int(output.strip())
            minutes = seconds // 60
            compliant = minutes <= 10
            return {'sleep_timeout_minutes': minutes, 'compliant': compliant, 'details': output.strip()}
        except Exception as e:
            return {'sleep_timeout_minutes': None, 'compliant': None, 'details': str(e)}
    elif system == 'Darwin':
        try:
            # Get sleep settings using pmset
            output = subprocess.check_output(['pmset', '-g', 'custom'], text=True)
            match = re.search(r'sleep\s+(\d+)', output)
            minutes = int(match.group(1)) if match else None
            compliant = minutes is not None and minutes <= 10
            return {'sleep_timeout_minutes': minutes, 'compliant': compliant, 'details': output.strip()}
        except Exception as e:
            return {'sleep_timeout_minutes': None, 'compliant': None, 'details': str(e)}
    return {'sleep_timeout_minutes': None, 'compliant': None, 'details': 'Not implemented'}

def collect_system_data():
    return {
        'os': platform.system(),
        'disk_encryption': check_disk_encryption(),
        'os_update': check_os_update_status(),
        'antivirus': check_antivirus_status(),
        'sleep_settings': check_sleep_settings(),
    }

def send_data_to_api(data):
    import requests
    import os
    # Persist machine_id in a file for consistent reporting
    machine_id_file = 'machine_id.txt'
    if os.path.exists(machine_id_file):
        with open(machine_id_file, 'r') as f:
            machine_id = f.read().strip()
        data['machine_id'] = machine_id
    response = None
    try:
        # Change the URL below to your backend server (Flask or FastAPI)
        url = 'http://localhost:8000/report'
        resp = requests.post(url, json=data, timeout=10)
        if resp.status_code == 200:
            result = resp.json()
            print('Data sent:', result)
            # Save machine_id if new
            if 'machine_id' in result:
                with open(machine_id_file, 'w') as f:
                    f.write(result['machine_id'])
        else:
            print('Failed to send data:', resp.status_code, resp.text)
    except Exception as e:
        print('Error sending data:', e)

def daemon_loop(interval_minutes=30):
    last_data = None
    while True:
        data = collect_system_data()
        if data != last_data:
            send_data_to_api(data)
            last_data = data
        time.sleep(interval_minutes * 60)

def start_daemon():
    t = threading.Thread(target=daemon_loop, daemon=True)
    t.start()

if __name__ == "__main__":
    print("System Utility Daemon starting...")
    if platform.system() == 'Windows' and not is_admin():
        print("WARNING: For full functionality (e.g., BitLocker check), run this script as Administrator.")
    start_daemon()
    while True:
        time.sleep(3600)  # Keep main thread alive
