import os
import time
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from config.config import Config
from models.models import db
from routes.auth_routes import auth_bp
from routes.hotel_routes import hotel_bp
from routes.room_routes import room_bp
from routes.booking_routes import booking_bp
from routes.payment_routes import payment_bp
from routes.admin_routes import admin_bp
from routes.health_routes import health_bp
from services.metrics_service import REQUEST_COUNT, REQUEST_LATENCY
from services.db_service import seed_sample_data_if_empty

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
)
logger = logging.getLogger('stayease')

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS
    CORS(app, origins=app.config.get('CORS_ORIGINS', '*'))

    # Check database connectivity before initializing SQLAlchemy
    db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
    if 'mysql' in db_uri and app.config.get('USE_SQLITE_FALLBACK', True):
        import socket
        host = app.config.get('DB_HOST', '127.0.0.1')
        port = int(app.config.get('DB_PORT', 3306))
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1.0)
        try:
            s.connect((host, port))
            s.close()
            logger.info(f"Connected to MySQL on {host}:{port}")
        except Exception:
            s.close()
            sqlite_path = os.path.join(os.path.dirname(__file__), 'stayease_local.db')
            app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{sqlite_path}'
            logger.info(f"MySQL not reachable on {host}:{port}. Switched to local SQLite: {sqlite_path}")

    # Setup database
    db.init_app(app)

    with app.app_context():
        try:
            db.create_all()
            seed_sample_data_if_empty()
        except Exception as err:
            logger.error(f"Error during database initialization: {err}")

    # Request metrics middleware
    @app.before_request
    def before_request_hook():
        request._start_time = time.time()

    @app.after_request
    def after_request_hook(response):
        if hasattr(request, '_start_time'):
            resp_time = time.time() - request._start_time
            endpoint = request.endpoint or request.path
            REQUEST_LATENCY.labels(method=request.method, endpoint=endpoint).observe(resp_time)
            REQUEST_COUNT.labels(method=request.method, endpoint=endpoint, status_code=response.status_code).inc()
        return response

    # Register Blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(hotel_bp)
    app.register_blueprint(room_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(admin_bp)

    # Global friendly error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'success': False, 'message': 'Bad Request: ' + str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'message': 'Requested resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'success': False, 'message': 'An internal server error occurred'}), 500

    # Serve built static frontend if present (for single-server mode / preview)
    dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'dist')
    if os.path.exists(dist_dir):
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_frontend(path):
            if path and os.path.exists(os.path.join(dist_dir, path)):
                return send_from_directory(dist_dir, path)
            return send_from_directory(dist_dir, 'index.html')

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    logger.info(f"Starting StayEase Hotel API server on http://{host}:{port}")
    app.run(host=host, port=port, debug=True)
