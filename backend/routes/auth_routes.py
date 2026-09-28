from datetime import datetime, timezone, timedelta
import re
from flask import Blueprint, request, jsonify, current_app
import jwt
from models.models import db, User
from routes.auth_middleware import token_required
from services.metrics_service import USERS_TOTAL_GAUGE

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

def generate_jwt(user):
    now = datetime.now(timezone.utc)
    payload = {
        'sub': str(user.id),
        'email': user.email,
        'role': user.role,
        'name': user.name,
        'exp': now + timedelta(seconds=current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 86400)),
        'iat': now
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')

    # Validations
    if not name or not email or not phone or not password:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({'success': False, 'message': 'Please provide a valid email address.'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long.'}), 400

    if confirm_password and password != confirm_password:
        return jsonify({'success': False, 'message': 'Passwords do not match.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'An account with this email already exists.'}), 409

    try:
        user = User(name=name, email=email, phone=phone, role='user')
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        token = generate_jwt(user)
        USERS_TOTAL_GAUGE.inc()

        return jsonify({
            'success': True,
            'message': 'Registration successful! Welcome to StayEase.',
            'token': token,
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid email address or password.'}), 401

    token = generate_jwt(user)

    return jsonify({
        'success': True,
        'message': f'Welcome back, {user.name}!',
        'token': token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({
        'success': True,
        'message': 'Logged out successfully.'
    }), 200


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'success': True,
        'user': current_user.to_dict()
    }), 200
