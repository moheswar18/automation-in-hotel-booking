import unittest
import json
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from config.config import Config
from models.models import db, User, Hotel, Room, Booking, Payment

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    JWT_SECRET_KEY = 'test-jwt-secret-key'

class StayEaseApiTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_health_check_endpoint(self):
        """Test health check endpoint for AWS ALB & monitoring"""
        res = self.client.get('/health')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['service'], 'hotel-booking-api')
        self.assertEqual(data['database']['status'], 'connected')

    def test_prometheus_metrics_endpoint(self):
        """Test Prometheus metrics exposition"""
        res = self.client.get('/metrics')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(b'http_requests_total' in res.data or b'hotel_registered_users_total' in res.data)

    def test_registration_and_authentication(self):
        """Test customer registration, JWT token generation, and login"""
        # Register new user
        reg_res = self.client.post('/api/register', json={
            'name': 'Test Traveler',
            'email': 'traveler@stayease.com',
            'phone': '+91 9876500000',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        })
        self.assertEqual(reg_res.status_code, 201)
        reg_data = json.loads(reg_res.data)
        self.assertTrue(reg_data['success'])
        self.assertIn('token', reg_data)
        token = reg_data['token']

        # Login
        login_res = self.client.post('/api/login', json={
            'email': 'traveler@stayease.com',
            'password': 'Password@123'
        })
        self.assertEqual(login_res.status_code, 200)
        login_data = json.loads(login_res.data)
        self.assertTrue(login_data['success'])

        # Authenticated profile
        me_res = self.client.get('/api/me', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(json.loads(me_res.data)['user']['email'], 'traveler@stayease.com')

    def test_hotels_listing_and_filtering(self):
        """Test hotel search and filtering capabilities"""
        res = self.client.get('/api/hotels')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        self.assertGreaterEqual(len(data['hotels']), 8)

        # Filter by location 'Goa'
        res_goa = self.client.get('/api/hotels?location=Goa')
        self.assertEqual(res_goa.status_code, 200)
        data_goa = json.loads(res_goa.data)
        self.assertGreaterEqual(len(data_goa['hotels']), 1)
        self.assertIn('Goa', data_goa['hotels'][0]['location'])

    def test_booking_and_payment_flow(self):
        """Test room reservation calculation, booking code generation, and payment simulation"""
        # 1. Login as demo customer
        login_res = self.client.post('/api/login', json={
            'email': 'john@example.com',
            'password': 'User@123'
        })
        token = json.loads(login_res.data)['token']

        # 2. Make booking
        booking_payload = {
            'hotel_id': 1,
            'room_id': 1,
            'check_in': '2026-11-10',
            'check_out': '2026-11-13',
            'guests': 2,
            'guest_name': 'John Doe',
            'guest_email': 'john@example.com',
            'guest_phone': '+91 9812345678',
            'special_requests': 'Late check-in requested.'
        }
        res_bkg = self.client.post('/api/bookings', json=booking_payload, headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(res_bkg.status_code, 201)
        bkg_data = json.loads(res_bkg.data)['booking']
        self.assertTrue(bkg_data['booking_id'].startswith('SE-BKG-'))
        self.assertEqual(bkg_data['nights'], 3)
        self.assertEqual(bkg_data['total_amount'], 25200.00)

        # 3. Simulate payment
        pay_res = self.client.post('/api/payments', json={
            'booking_id': bkg_data['id'],
            'payment_method': 'upi'
        }, headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(pay_res.status_code, 200)
        pay_data = json.loads(pay_res.data)
        self.assertTrue(pay_data['success'])
        self.assertTrue(pay_data['transaction_reference'].startswith('TXN-UPI-'))

if __name__ == '__main__':
    unittest.main()
