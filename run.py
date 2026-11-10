import os
import sys
import subprocess
from pathlib import Path

def main():
    root_dir = Path(__file__).resolve().parent
    backend_dir = root_dir / "backend"
    venv_python = backend_dir / "venv" / "Scripts" / "python.exe"

    if venv_python.exists():
        python_exe = str(venv_python)
    else:
        python_exe = sys.executable

    print("=" * 60)
    print("  CareerPilot AI - Starting Local Server")
    print(f"  Working Directory: {backend_dir}")
    print(f"  Python Interpreter: {python_exe}")
    print("  URL: http://localhost:8000/")
    print("=" * 60)

    cmd = [python_exe, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

    try:
        subprocess.run(cmd, cwd=str(backend_dir))
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == "__main__":
    main()
