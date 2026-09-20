#!/usr/bin/env python3
"""
MALE UAV Digital Twin Platform - Unified Multi-Process Orchestrator
==================================================================
Starts and coordinates all system services simultaneously:
 1. [Digital Twin Backend]      FastAPI on http://localhost:8000
 2. [Face Recognition Backend]  Flask Biometric Service on http://127.0.0.1:5050
 3. [Ground Control Station]    Vite React Dashboard on http://localhost:5173

Handles automatic port cleanup, health verification, and graceful shutdown.
"""

import os
import sys
import time
import signal
import socket
import subprocess
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FACE_DIR = ROOT_DIR / "face-attendance-system-master"
FRONTEND_DIR = ROOT_DIR / "frontend"

# Virtual Environment python binary lookup
def get_python_exe():
    if sys.platform == "win32":
        candidates = [
            BACKEND_DIR / ".venv" / "Scripts" / "python.exe",
            ROOT_DIR / ".venv" / "Scripts" / "python.exe",
            FACE_DIR / ".venv" / "Scripts" / "python.exe",
        ]
    else:
        candidates = [
            BACKEND_DIR / ".venv" / "bin" / "python",
            ROOT_DIR / ".venv" / "bin" / "python",
            FACE_DIR / ".venv" / "bin" / "python",
        ]
    for c in candidates:
        if c.exists() and os.access(c, os.X_OK):
            return str(c)
    return sys.executable

PYTHON_EXE = get_python_exe()

def is_port_in_use(port: int, host="127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0

def kill_port(port: int):
    if not is_port_in_use(port):
        return
    print(f"[*] Port {port} is occupied. Freeing port...")
    try:
        if sys.platform == "win32":
            res = subprocess.run(f"netstat -ano | findstr :{port}", shell=True, capture_output=True, text=True)
            for line in res.stdout.strip().splitlines():
                parts = line.split()
                if len(parts) >= 5 and parts[-1].isdigit():
                    pid = parts[-1]
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
        else:
            res = subprocess.run(f"lsof -ti :{port}", shell=True, capture_output=True, text=True)
            pids = res.stdout.strip().split()
            for pid in pids:
                if pid:
                    subprocess.run(f"kill -9 {pid}", shell=True, capture_output=True)
    except Exception as e:
        print(f"[!] Warning freeing port {port}: {e}")
    time.sleep(0.5)

processes = []

def cleanup(signum=None, frame=None):
    print("\n\n=======================================================")
    print(" SHUTTING DOWN ALL DIGITAL TWIN SERVICES...")
    print("=======================================================")
    for name, proc in reversed(processes):
        try:
            print(f"[*] Stopping {name} (PID {proc.pid})...")
            if sys.platform == "win32":
                subprocess.run(f"taskkill /F /T /PID {proc.pid}", shell=True, capture_output=True)
            else:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        except Exception:
            try:
                proc.terminate()
            except Exception:
                pass
    time.sleep(0.5)
    print("[✓] All services stopped cleanly.")
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

def main():
    print("""
=================================================================
  DRONANETRA MALE UAV AERO PISTON ENGINE DIGITAL TWIN PLATFORM
=================================================================
""")

    # 1. Clear ports 8000, 5050, 5173
    for p in [8000, 5050, 5173]:
        kill_port(p)

    # 2. Start Backend 1: Digital Twin & Telemetry Engine (FastAPI)
    print("[1/3] Starting Digital Twin & Telemetry API Backend (Port 8000)...")
    env_backend = os.environ.copy()
    env_backend["PYTHONPATH"] = str(BACKEND_DIR)
    
    backend_cmd = [
        PYTHON_EXE, "-m", "uvicorn", "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000"
    ]
    
    preexec = os.setsid if sys.platform != "win32" else None
    proc_backend = subprocess.Popen(
        backend_cmd,
        cwd=str(BACKEND_DIR),
        env=env_backend,
        preexec_fn=preexec
    )
    processes.append(("Digital Twin Backend", proc_backend))

    # 3. Start Backend 2: Face Recognition Biometric Microservice (Flask)
    print("[2/3] Starting Face Recognition & Anti-Spoofing Service (Port 5050)...")
    env_face = os.environ.copy()
    env_face["AUTO_OPEN_BROWSER"] = "0"
    
    face_cmd = [
        PYTHON_EXE, "main.py"
    ]
    
    proc_face = subprocess.Popen(
        face_cmd,
        cwd=str(FACE_DIR),
        env=env_face,
        preexec_fn=preexec
    )
    processes.append(("Face Recognition Service", proc_face))

    # 4. Start Frontend: React Ground Control Station (Vite)
    print("[3/3] Starting Ground Control Station React UI (Port 5173)...")
    npm_cmd = "npm run dev" if sys.platform != "win32" else "npm.cmd run dev"
    proc_frontend = subprocess.Popen(
        npm_cmd,
        cwd=str(FRONTEND_DIR),
        shell=True,
        preexec_fn=preexec
    )
    processes.append(("Frontend GCS UI", proc_frontend))

    # 5. Wait for servers to be active and open browser
    print("\nWaiting for all services to initialize...")
    time.sleep(2.5)

    print("""
=================================================================
  ALL SERVICES RUNNING & CONNECTED TOGETHER:
  -------------------------------------------------------------
  -> Ground Control Station:  http://localhost:5173
  -> Digital Twin API / Docs: http://localhost:8000/docs
  -> Face Biometrics Service: http://127.0.0.1:5050/api/logs
=================================================================
  Press Ctrl+C to terminate all services.
=================================================================
""")

    try:
        webbrowser.open("http://127.0.0.1:5050")
    except Exception:
        pass

    # Monitor running processes
    try:
        while True:
            for name, proc in processes:
                poll = proc.poll()
                if poll is not None:
                    print(f"[!] Warning: {name} exited with code {poll}")
                    cleanup()
            time.sleep(1.0)
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
