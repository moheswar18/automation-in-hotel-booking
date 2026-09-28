from flask import Blueprint, jsonify
from sqlalchemy import func
from models.models import db, User, Hotel, Room, Booking, Payment
from routes.auth_middleware import admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard_metrics(current_user):
    """
    Aggregates comprehensive KPIs and chart metrics for the Admin Dashboard:
    - Overall counters: Users, Hotels, Rooms, Total Bookings, Confirmed, Cancelled, Revenue
    - Chart data: Status breakdown, monthly trend, top destinations
    """
    total_users = User.query.count()
    total_hotels = Hotel.query.count()
    total_rooms = Room.query.count()
    total_bookings = Booking.query.count()
    confirmed_bookings = Booking.query.filter_by(status='confirmed').count()
    cancelled_bookings = Booking.query.filter_by(status='cancelled').count()
    completed_bookings = Booking.query.filter_by(status='completed').count()

    # Calculate total revenue from successful payments or confirmed bookings
    revenue_sum = db.session.query(func.sum(Booking.total_amount)).filter(
        Booking.status.in_(['confirmed', 'completed'])
    ).scalar() or 0.0

    # Bookings by status for Pie / Donut Chart
    status_chart = [
        {'name': 'Confirmed', 'value': confirmed_bookings, 'color': '#10B981'},
        {'name': 'Completed', 'value': completed_bookings, 'color': '#3B82F6'},
        {'name': 'Cancelled', 'value': cancelled_bookings, 'color': '#EF4444'}
    ]

    # Destination popularity / bookings count by hotel location
    dest_data = db.session.query(
        Hotel.location,
        func.count(Booking.id).label('booking_count')
    ).join(Booking, Hotel.id == Booking.hotel_id, isouter=True)\
     .group_by(Hotel.location).all()

    destination_chart = [
        {'location': loc, 'bookings': count}
        for loc, count in dest_data
    ]

    # Recent 10 bookings
    recent_bookings = Booking.query.order_by(Booking.booking_date.desc()).limit(10).all()

    return jsonify({
        'success': True,
        'statistics': {
            'total_users': total_users,
            'total_hotels': total_hotels,
            'total_rooms': total_rooms,
            'total_bookings': total_bookings,
            'confirmed_bookings': confirmed_bookings,
            'cancelled_bookings': cancelled_bookings,
            'completed_bookings': completed_bookings,
            'total_revenue': float(revenue_sum)
        },
        'charts': {
            'bookings_by_status': status_chart,
            'destinations': destination_chart
        },
        'recent_bookings': [b.to_dict() for b in recent_bookings]
    }), 200
