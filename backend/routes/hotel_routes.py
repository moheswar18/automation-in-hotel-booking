from flask import Blueprint, request, jsonify
from models.models import db, Hotel, Room
from routes.auth_middleware import admin_required

hotel_bp = Blueprint('hotels', __name__, url_prefix='/api/hotels')

@hotel_bp.route('', methods=['GET'])
def get_hotels():
    """
    Search and filter hotels with sorting:
    - location: substring match
    - min_price / max_price: starting price boundary
    - rating: minimum rating
    - facility: filter by amenity presence
    - room_type: filter hotels that have matching room type
    - sort_by: 'price_asc', 'price_desc', 'rating_desc'
    """
    location = request.args.get('location', '').strip()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    min_rating = request.args.get('rating', type=float)
    facility_filter = request.args.get('facility', '').strip()
    room_type_filter = request.args.get('room_type', '').strip()
    sort_by = request.args.get('sort_by', 'rating_desc')

    query = Hotel.query

    if location:
        query = query.filter(
            (Hotel.location.ilike(f'%{location}%')) | 
            (Hotel.name.ilike(f'%{location}%'))
        )

    if min_rating:
        query = query.filter(Hotel.rating >= min_rating)

    if facility_filter:
        query = query.filter(Hotel.facilities.ilike(f'%{facility_filter}%'))

    hotels = query.all()

    # Convert to dicts with computed starting price
    hotel_list = []
    for h in hotels:
        h_dict = h.to_dict()
        
        # Apply room-level filters
        if room_type_filter:
            matching_room = any(room_type_filter.lower() in r.room_type.lower() for r in h.rooms)
            if not matching_room:
                continue

        if min_price is not None and h_dict['starting_price'] < min_price:
            continue

        if max_price is not None and h_dict['starting_price'] > max_price:
            continue

        hotel_list.append(h_dict)

    # Sorting
    if sort_by == 'price_asc':
        hotel_list.sort(key=lambda x: x['starting_price'])
    elif sort_by == 'price_desc':
        hotel_list.sort(key=lambda x: x['starting_price'], reverse=True)
    elif sort_by == 'rating_desc':
        hotel_list.sort(key=lambda x: x['rating'], reverse=True)

    return jsonify({
        'success': True,
        'count': len(hotel_list),
        'hotels': hotel_list
    }), 200


@hotel_bp.route('/<int:hotel_id>', methods=['GET'])
def get_hotel_details(hotel_id):
    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({'success': False, 'message': f'Hotel with ID {hotel_id} not found'}), 404

    return jsonify({
        'success': True,
        'hotel': hotel.to_dict(include_rooms=True)
    }), 200


@hotel_bp.route('', methods=['POST'])
@admin_required
def create_hotel(current_user):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    location = data.get('location', '').strip()
    address = data.get('address', '').strip()
    description = data.get('description', '').strip()
    rating = data.get('rating', 4.5)
    image = data.get('image', '').strip()
    facilities = data.get('facilities', '')

    if isinstance(facilities, list):
        facilities = ", ".join(facilities)

    if not name or not location or not description:
        return jsonify({'success': False, 'message': 'Hotel name, location, and description are required'}), 400

    if not image:
        image = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'

    try:
        hotel = Hotel(
            name=name,
            location=location,
            address=address,
            description=description,
            rating=float(rating),
            image=image,
            facilities=facilities
        )
        db.session.add(hotel)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Hotel created successfully',
            'hotel': hotel.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to create hotel: {str(e)}'}), 500


@hotel_bp.route('/<int:hotel_id>', methods=['PUT'])
@admin_required
def update_hotel(current_user, hotel_id):
    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({'success': False, 'message': f'Hotel with ID {hotel_id} not found'}), 404

    data = request.get_json() or {}
    if 'name' in data:
        hotel.name = data['name'].strip()
    if 'location' in data:
        hotel.location = data['location'].strip()
    if 'address' in data:
        hotel.address = data['address'].strip()
    if 'description' in data:
        hotel.description = data['description'].strip()
    if 'rating' in data:
        hotel.rating = float(data['rating'])
    if 'image' in data:
        hotel.image = data['image'].strip()
    if 'facilities' in data:
        fac = data['facilities']
        hotel.facilities = ", ".join(fac) if isinstance(fac, list) else str(fac)

    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Hotel updated successfully',
            'hotel': hotel.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to update hotel: {str(e)}'}), 500


@hotel_bp.route('/<int:hotel_id>', methods=['DELETE'])
@admin_required
def delete_hotel(current_user, hotel_id):
    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({'success': False, 'message': f'Hotel with ID {hotel_id} not found'}), 404

    try:
        db.session.delete(hotel)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Hotel "{hotel.name}" and its associated rooms have been deleted.'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to delete hotel: {str(e)}'}), 500
