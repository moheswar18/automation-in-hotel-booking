from flask import Blueprint, request, jsonify
from models.models import db, Hotel, Room
from routes.auth_middleware import admin_required
from services.metrics_service import ACTIVE_ROOMS_GAUGE

room_bp = Blueprint('rooms', __name__, url_prefix='/api')

@room_bp.route('/hotels/<int:hotel_id>/rooms', methods=['GET'])
def get_hotel_rooms(hotel_id):
    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({'success': False, 'message': f'Hotel with ID {hotel_id} not found'}), 404

    rooms = Room.query.filter_by(hotel_id=hotel_id).all()
    return jsonify({
        'success': True,
        'hotel_id': hotel_id,
        'hotel_name': hotel.name,
        'rooms': [r.to_dict() for r in rooms]
    }), 200


@room_bp.route('/rooms', methods=['POST'])
@admin_required
def create_room(current_user):
    data = request.get_json() or {}
    hotel_id = data.get('hotel_id')
    room_type = data.get('room_type', '').strip()
    price = data.get('price')
    capacity = data.get('capacity', 2)
    bed_type = data.get('bed_type', 'Queen Bed')
    description = data.get('description', '')
    image = data.get('image', '').strip()
    total_quantity = data.get('total_quantity', 10)

    if not hotel_id or not room_type or price is None:
        return jsonify({'success': False, 'message': 'hotel_id, room_type, and price are required'}), 400

    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({'success': False, 'message': f'Hotel with ID {hotel_id} not found'}), 404

    if not image:
        image = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'

    try:
        room = Room(
            hotel_id=hotel_id,
            room_type=room_type,
            price=float(price),
            capacity=int(capacity),
            bed_type=bed_type,
            description=description,
            image=image,
            availability=True,
            total_quantity=int(total_quantity)
        )
        db.session.add(room)
        db.session.commit()
        ACTIVE_ROOMS_GAUGE.inc()

        return jsonify({
            'success': True,
            'message': 'Room created successfully',
            'room': room.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to create room: {str(e)}'}), 500


@room_bp.route('/rooms/<int:room_id>', methods=['PUT'])
@admin_required
def update_room(current_user, room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({'success': False, 'message': f'Room with ID {room_id} not found'}), 404

    data = request.get_json() or {}
    if 'room_type' in data:
        room.room_type = data['room_type'].strip()
    if 'price' in data:
        room.price = float(data['price'])
    if 'capacity' in data:
        room.capacity = int(data['capacity'])
    if 'bed_type' in data:
        room.bed_type = data['bed_type'].strip()
    if 'description' in data:
        room.description = data['description'].strip()
    if 'image' in data:
        room.image = data['image'].strip()
    if 'availability' in data:
        room.availability = bool(data['availability'])
    if 'total_quantity' in data:
        room.total_quantity = int(data['total_quantity'])

    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Room updated successfully',
            'room': room.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to update room: {str(e)}'}), 500


@room_bp.route('/rooms/<int:room_id>/availability', methods=['PATCH'])
@admin_required
def toggle_room_availability(current_user, room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({'success': False, 'message': f'Room with ID {room_id} not found'}), 404

    data = request.get_json() or {}
    if 'availability' in data:
        room.availability = bool(data['availability'])
    else:
        room.availability = not room.availability

    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Room availability set to {room.availability}',
            'room': room.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to update availability: {str(e)}'}), 500


@room_bp.route('/rooms/<int:room_id>', methods=['DELETE'])
@admin_required
def delete_room(current_user, room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({'success': False, 'message': f'Room with ID {room_id} not found'}), 404

    try:
        db.session.delete(room)
        db.session.commit()
        ACTIVE_ROOMS_GAUGE.dec()
        return jsonify({
            'success': True,
            'message': f'Room "{room.room_type}" has been deleted.'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to delete room: {str(e)}'}), 500
