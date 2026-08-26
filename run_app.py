import os
import sys
import subprocess
import time
import webbrowser

def main():
    print("=" * 65)
    print("  THERMOSHELL - DRDO Passive Solar Architecture Matchmaker")
    print("  Smart India Hackathon 2026")
    print("=" * 65)
    
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    frontend_dir = os.path.join(os.path.dirname(__file__), 'frontend')
    
    print("\n[1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_cmd = [sys.executable, '-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000']
    backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir)
    
    time.sleep(2)
    
    print("[2/3] Starting Vite React Frontend on http://localhost:5174 ...")
    frontend_cmd = ['npm.cmd', 'run', 'dev']
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=frontend_dir)
    
    time.sleep(3)
    print("\n[3/3] Opening ThermoShell Dashboard in browser...")
    webbrowser.open('http://localhost:5174')
    
    print("\n>>> ThermoShell is LIVE and running! Press Ctrl+C to terminate. <<<\n")
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down ThermoShell services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Services stopped.")

if __name__ == '__main__':
    main()
