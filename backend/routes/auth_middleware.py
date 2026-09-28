from functools import wraps
from flask import request, jsonify, current_app
import jwt
from models.models import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
            else:
                token = auth_header

        if not token:
            return jsonify({'success': False, 'message': 'Authentication token is missing'}), 401

        try:
            payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            user_id = int(payload['sub'])
            current_user = User.query.get(user_id)
            if not current_user:
                return jsonify({'success': False, 'message': 'User belonging to token no longer exists'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Session expired. Please log in again.'}), 401
        except (jwt.InvalidTokenError, Exception) as e:
            return jsonify({'success': False, 'message': f'Invalid authentication token: {str(e)}'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
            else:
                token = auth_header

        if not token:
            return jsonify({'success': False, 'message': 'Admin authentication token is missing'}), 401

        try:
            payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            user_id = int(payload['sub'])
            current_user = User.query.get(user_id)
            if not current_user or current_user.role != 'admin':
                return jsonify({'success': False, 'message': 'Admin privileges required to access this resource'}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Session expired. Please log in again.'}), 401
        except Exception:
            return jsonify({'success': False, 'message': 'Invalid admin authorization token'}), 401

        return f(current_user, *args, **kwargs)

    return decorated
