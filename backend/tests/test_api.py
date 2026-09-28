import pytest
import json
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from config.config import Config
from models.models import db, User, Hotel, Room, Booking

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    JWT_SECRET_KEY = 'test-jwt-secret-key'

@pytest.fixture
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_health_check(client):
    """Test health check endpoint for AWS ALB & monitoring"""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'
    assert data['service'] == 'hotel-booking-api'
    assert data['database']['status'] == 'connected'

def test_prometheus_metrics(client):
    """Test Prometheus metrics exposition"""
    response = client.get('/metrics')
    assert response.status_code == 200
    assert b'http_requests_total' in response.data or b'hotel_bookings_total' in response.data

def test_user_registration_and_login(client):
    """Test full customer registration and authentication flow"""
    # 1. Register
    reg_payload = {
        'name': 'Test Traveler',
        'email': 'traveler@test.com',
        'phone': '+91 9999988888',
        'password': 'Password@123',
        'confirm_password': 'Password@123'
    }
    reg_res = client.post('/api/register', json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = json.loads(reg_res.data)
    assert reg_data['success'] is True
    assert 'token' in reg_data
    token = reg_data['token']

    # 2. Login
    login_res = client.post('/api/login', json={
        'email': 'traveler@test.com',
        'password': 'Password@123'
    })
    assert login_res.status_code == 200
    login_data = json.loads(login_res.data)
    assert login_data['success'] is True

    # 3. Profile /me
    me_res = client.get('/api/me', headers={'Authorization': f'Bearer {token}'})
    assert me_res.status_code == 200
    assert json.loads(me_res.data)['user']['email'] == 'traveler@test.com'

def test_hotel_listing_and_filtering(client):
    """Test hotel search and filtering capabilities"""
    res = client.get('/api/hotels')
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data['success'] is True
    assert len(data['hotels']) >= 8

    # Filter by location 'Goa'
    res_goa = client.get('/api/hotels?location=Goa')
    assert res_goa.status_code == 200
    data_goa = json.loads(res_goa.data)
    assert len(data_goa['hotels']) >= 1
    assert 'Goa' in data_goa['hotels'][0]['location']
