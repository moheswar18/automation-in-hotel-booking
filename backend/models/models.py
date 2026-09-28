from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user', index=True) # 'user' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bookings = db.relationship('Booking', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Hotel(db.Model):
    __tablename__ = 'hotels'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(100), nullable=False, index=True)
    address = db.Column(db.String(255), default='')
    description = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Float, default=4.5, index=True)
    image = db.Column(db.String(500), nullable=False)
    facilities = db.Column(db.Text, nullable=False) # comma-separated list
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    rooms = db.relationship('Room', backref='hotel', lazy=True, cascade='all, delete-orphan')
    bookings = db.relationship('Booking', backref='hotel', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_rooms=False):
        data = {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'address': self.address,
            'description': self.description,
            'rating': float(self.rating) if self.rating else 4.5,
            'image': self.image,
            'facilities': [f.strip() for f in self.facilities.split(',') if f.strip()],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_rooms:
            data['rooms'] = [room.to_dict() for room in self.rooms]
            data['starting_price'] = min([r.price for r in self.rooms]) if self.rooms else 0
        else:
            data['starting_price'] = min([r.price for r in self.rooms]) if self.rooms else 0
            data['room_count'] = len(self.rooms)
        return data


class Room(db.Model):
    __tablename__ = 'rooms'

    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id', ondelete='CASCADE'), nullable=False, index=True)
    room_type = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False, index=True)
    capacity = db.Column(db.Integer, default=2)
    bed_type = db.Column(db.String(50), default='Queen Bed')
    description = db.Column(db.Text, default='')
    image = db.Column(db.String(500), nullable=False)
    availability = db.Column(db.Boolean, default=True, index=True)
    total_quantity = db.Column(db.Integer, default=10)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bookings = db.relationship('Booking', backref='room', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'hotel_id': self.hotel_id,
            'room_type': self.room_type,
            'price': float(self.price),
            'capacity': self.capacity,
            'bed_type': self.bed_type,
            'description': self.description,
            'image': self.image,
            'availability': self.availability,
            'total_quantity': self.total_quantity
        }


class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.String(30), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id', ondelete='CASCADE'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id', ondelete='CASCADE'), nullable=False)
    check_in = db.Column(db.Date, nullable=False)
    check_out = db.Column(db.Date, nullable=False)
    guests = db.Column(db.Integer, default=1)
    guest_name = db.Column(db.String(100), nullable=False)
    guest_email = db.Column(db.String(150), nullable=False)
    guest_phone = db.Column(db.String(20), nullable=False)
    special_requests = db.Column(db.Text, default='')
    nights = db.Column(db.Integer, default=1)
    room_price = db.Column(db.Float, nullable=False)
    tax_amount = db.Column(db.Float, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='confirmed', index=True) # 'confirmed', 'cancelled', 'completed'
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payments = db.relationship('Payment', backref='booking', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'user_id': self.user_id,
            'hotel_id': self.hotel_id,
            'hotel_name': self.hotel.name if self.hotel else 'N/A',
            'hotel_image': self.hotel.image if self.hotel else '',
            'hotel_location': self.hotel.location if self.hotel else '',
            'room_id': self.room_id,
            'room_type': self.room.room_type if self.room else 'N/A',
            'check_in': self.check_in.strftime('%Y-%m-%d') if self.check_in else '',
            'check_out': self.check_out.strftime('%Y-%m-%d') if self.check_out else '',
            'guests': self.guests,
            'guest_name': self.guest_name,
            'guest_email': self.guest_email,
            'guest_phone': self.guest_phone,
            'special_requests': self.special_requests,
            'nights': self.nights,
            'room_price': float(self.room_price),
            'tax_amount': float(self.tax_amount),
            'total_amount': float(self.total_amount),
            'status': self.status,
            'booking_date': self.booking_date.strftime('%Y-%m-%d %H:%M:%S') if self.booking_date else '',
            'payment': self.payments[0].to_dict() if self.payments else None
        }


class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id', ondelete='CASCADE'), nullable=False)
    payment_method = db.Column(db.String(30), nullable=False) # 'card', 'upi', 'netbanking'
    amount = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(30), default='successful')
    transaction_reference = db.Column(db.String(100), unique=True, nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'payment_method': self.payment_method,
            'amount': float(self.amount),
            'payment_status': self.payment_status,
            'transaction_reference': self.transaction_reference,
            'payment_date': self.payment_date.strftime('%Y-%m-%d %H:%M:%S') if self.payment_date else ''
        }
