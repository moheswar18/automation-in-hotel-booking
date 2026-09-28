from datetime import datetime, date
import random
from flask import Blueprint, request, jsonify
from models.models import db, Booking, Hotel, Room, Payment
from routes.auth_middleware import token_required
from services.metrics_service import BOOKINGS_TOTAL, HOTEL_REVENUE

booking_bp = Blueprint('bookings', __name__, url_prefix='/api/bookings')

def generate_booking_reference():
    return f"SE-BKG-{random.randint(10000, 99999)}"

@booking_bp.route('', methods=['POST'])
@token_required
def create_booking(current_user):
    data = request.get_json() or {}
    hotel_id = data.get('hotel_id')
    room_id = data.get('room_id')
    check_in_str = data.get('check_in')
    check_out_str = data.get('check_out')
    guests = data.get('guests', 1)
    guest_name = data.get('guest_name', current_user.name).strip()
    guest_email = data.get('guest_email', current_user.email).strip().lower()
    guest_phone = data.get('guest_phone', current_user.phone).strip()
    special_requests = data.get('special_requests', '').strip()

    if not hotel_id or not room_id or not check_in_str or not check_out_str:
        return jsonify({'success': False, 'message': 'hotel_id, room_id, check_in, and check_out are required'}), 400

    try:
        check_in = datetime.strptime(check_in_str, '%Y-%m-%d').date()
        check_out = datetime.strptime(check_out_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD'}), 400

    if check_in < date.today():
        return jsonify({'success': False, 'message': 'Check-in date cannot be in the past'}), 400

    if check_out <= check_in:
        return jsonify({'success': False, 'message': 'Check-out date must be after check-in date'}), 400

    nights = (check_out - check_in).days
    if nights < 1:
        nights = 1

    room = Room.query.get(room_id)
    if not room or room.hotel_id != hotel_id:
        return jsonify({'success': False, 'message': 'Selected room is not found in the designated hotel'}), 404

    if not room.availability:
        return jsonify({'success': False, 'message': 'The selected room is currently unavailable for booking'}), 400

    if int(guests) > room.capacity:
        return jsonify({'success': False, 'message': f'Maximum guest capacity for this room is {room.capacity}'}), 400

    room_price = float(room.price)
    base_amount = room_price * nights
    tax_amount = round(base_amount * 0.12, 2) # 12% GST
    total_amount = round(base_amount + tax_amount, 2)
    booking_ref = generate_booking_reference()

    try:
        booking = Booking(
            booking_id=booking_ref,
            user_id=current_user.id,
            hotel_id=hotel_id,
            room_id=room_id,
            check_in=check_in,
            check_out=check_out,
            guests=int(guests),
            guest_name=guest_name,
            guest_email=guest_email,
            guest_phone=guest_phone,
            special_requests=special_requests,
            nights=nights,
            room_price=room_price,
            tax_amount=tax_amount,
            total_amount=total_amount,
            status='confirmed'
        )
        db.session.add(booking)
        db.session.commit()

        # Update business metrics
        BOOKINGS_TOTAL.labels(status='confirmed').inc()
        HOTEL_REVENUE.inc(total_amount)

        return jsonify({
            'success': True,
            'message': 'Booking confirmed successfully!',
            'booking': booking.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to process booking: {str(e)}'}), 500


@booking_bp.route('', methods=['GET'])
@token_required
def get_bookings(current_user):
    """
    Returns user's bookings, or all bookings if admin.
    Supports query param ?status=confirmed|cancelled|completed
    """
    status_filter = request.args.get('status', '').strip()
    search_query = request.args.get('q', '').strip()

    if current_user.role == 'admin':
        query = Booking.query
    else:
        query = Booking.query.filter_by(user_id=current_user.id)

    if status_filter:
        query = query.filter_by(status=status_filter)

    if search_query:
        query = query.join(Hotel).filter(
            (Booking.booking_id.ilike(f'%{search_query}%')) |
            (Booking.guest_name.ilike(f'%{search_query}%')) |
            (Hotel.name.ilike(f'%{search_query}%'))
        )

    bookings = query.order_by(Booking.booking_date.desc()).all()

    return jsonify({
        'success': True,
        'count': len(bookings),
        'bookings': [b.to_dict() for b in bookings]
    }), 200


@booking_bp.route('/<int:booking_id>', methods=['GET'])
@token_required
def get_booking_details(current_user, booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'success': False, 'message': f'Booking with ID {booking_id} not found'}), 404

    # Non-admin users can only view their own bookings
    if current_user.role != 'admin' and booking.user_id != current_user.id:
        return jsonify({'success': False, 'message': 'Access denied to this booking'}), 403

    return jsonify({
        'success': True,
        'booking': booking.to_dict()
    }), 200


@booking_bp.route('/<int:booking_id>', methods=['PUT'])
@token_required
def update_booking(current_user, booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'success': False, 'message': f'Booking with ID {booking_id} not found'}), 404

    if current_user.role != 'admin' and booking.user_id != current_user.id:
        return jsonify({'success': False, 'message': 'Unauthorized to modify this booking'}), 403

    data = request.get_json() or {}
    new_status = data.get('status')

    if new_status:
        if new_status not in ('confirmed', 'cancelled', 'completed'):
            return jsonify({'success': False, 'message': 'Invalid status. Allowed: confirmed, cancelled, completed'}), 400

        # If cancelling
        if new_status == 'cancelled' and booking.status != 'cancelled':
            BOOKINGS_TOTAL.labels(status='cancelled').inc()

        booking.status = new_status

    if current_user.role == 'admin':
        if 'guest_name' in data:
            booking.guest_name = data['guest_name'].strip()
        if 'guest_phone' in data:
            booking.guest_phone = data['guest_phone'].strip()
        if 'special_requests' in data:
            booking.special_requests = data['special_requests'].strip()

    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Booking status updated to {booking.status}',
            'booking': booking.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to update booking: {str(e)}'}), 500


@booking_bp.route('/<int:booking_id>', methods=['DELETE'])
@token_required
def delete_booking(current_user, booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'success': False, 'message': f'Booking with ID {booking_id} not found'}), 404

    if current_user.role != 'admin':
        return jsonify({'success': False, 'message': 'Admin privilege required to delete booking records'}), 403

    try:
        db.session.delete(booking)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Booking {booking.booking_id} deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to delete booking: {str(e)}'}), 500
