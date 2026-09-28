import random
from datetime import datetime
from flask import Blueprint, request, jsonify
from models.models import db, Booking, Payment
from routes.auth_middleware import token_required

payment_bp = Blueprint('payments', __name__, url_prefix='/api/payments')

@payment_bp.route('', methods=['POST'])
@token_required
def process_payment(current_user):
    """
    Simulates academic project payment processing for Card, UPI, or Net Banking.
    Validates booking reference, records payment receipt, and confirms reservation.
    """
    data = request.get_json() or {}
    booking_id = data.get('booking_id')
    payment_method = data.get('payment_method', 'card').lower()

    if not booking_id:
        return jsonify({'success': False, 'message': 'booking_id is required'}), 400

    if payment_method not in ('card', 'upi', 'netbanking'):
        return jsonify({'success': False, 'message': 'Unsupported payment method. Choose card, upi, or netbanking'}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        # Check by alphanumeric booking_id code
        booking = Booking.query.filter_by(booking_id=booking_id).first()

    if not booking:
        return jsonify({'success': False, 'message': 'Booking reservation not found'}), 404

    if current_user.role != 'admin' and booking.user_id != current_user.id:
        return jsonify({'success': False, 'message': 'Unauthorized to make payment for this booking'}), 403

    # Generate simulated transaction reference
    prefix = {
        'card': 'TXN-CARD',
        'upi': 'TXN-UPI',
        'netbanking': 'TXN-NB'
    }.get(payment_method, 'TXN')

    tx_ref = f"{prefix}-{random.randint(100000000, 999999999)}"

    try:
        payment = Payment(
            booking_id=booking.id,
            payment_method=payment_method,
            amount=booking.total_amount,
            payment_status='successful',
            transaction_reference=tx_ref,
            payment_date=datetime.utcnow()
        )
        booking.status = 'confirmed'

        db.session.add(payment)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Booking Confirmed Successfully!',
            'transaction_reference': tx_ref,
            'payment': payment.to_dict(),
            'booking': booking.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Payment simulation failed: {str(e)}'}), 500
