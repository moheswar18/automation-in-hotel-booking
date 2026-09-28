#!/usr/bin/env python3
"""
==============================================================================
StayEase: Infrastructure Automation for Hotel Booking System
Local Demo Runner & Presentation Launcher
==============================================================================
Usage:
    python run_local.py
"""

import os
import sys
import webbrowser
import time
import threading

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app import create_app

def open_browser():
    time.sleep(1.5)
    print("\n[INFO] Launching browser: http://localhost:5000")
    webbrowser.open("http://localhost:5000")

def main():
    print("=" * 70)
    print("  StayEase — Infrastructure Automation for Hotel Booking System")
    print("=" * 70)
    print("  Technology Stack:")
    print("  - Frontend: React.js SPA, Tailwind CSS")
    print("  - Backend: Python Flask REST API")
    print("  - Database: MySQL 8.0 / SQLite (Self-healing & Auto-seeded)")
    print("  - Infrastructure: Terraform (AWS), Ansible, Docker, GitHub Actions")
    print("  - Monitoring: Prometheus (/metrics) & Grafana (Port 3001)")
    print("=" * 70)
    print("  Demo Accounts:")
    print("  👑 Administrator : admin@stayease.com  /  Admin@123")
    print("  👤 Customer Demo : john@example.com   /  User@123")
    print("=" * 70)
    print("  Active Endpoints:")
    print("  - Web Application: http://localhost:5000/")
    print("  - Health Check   : http://localhost:5000/health")
    print("  - Prometheus     : http://localhost:5000/metrics")
    print("=" * 70)

    threading.Thread(target=open_browser, daemon=True).start()

    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=False)

if __name__ == '__main__':
    main()
