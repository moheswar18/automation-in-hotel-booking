import time
from datetime import datetime
from flask import Blueprint, jsonify, Response
from services.db_service import check_db_health
from services.metrics_service import get_metrics_payload

health_bp = Blueprint('health', __name__)
START_TIME = time.time()

@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for:
    - AWS Application Load Balancer target group health checks
    - Docker container HEALTHCHECK
    - CI/CD post-deployment validation
    - Uptime monitoring
    """
    db_ok, db_msg = check_db_health()
    uptime_seconds = int(time.time() - START_TIME)

    status_code = 200 if db_ok else 503
    return jsonify({
        "status": "healthy" if db_ok else "degraded",
        "service": "hotel-booking-api",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "uptime_seconds": uptime_seconds,
        "database": {
            "status": "connected" if db_ok else "unreachable",
            "message": db_msg
        },
        "environment": "production"
    }), status_code


@health_bp.route('/metrics', methods=['GET'])
def metrics():
    """
    Exposes Prometheus application metrics for scraping.
    """
    content, content_type = get_metrics_payload()
    return Response(content, mimetype=content_type)
