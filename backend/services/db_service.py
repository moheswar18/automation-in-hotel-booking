import logging
from datetime import datetime, date
from werkzeug.security import generate_password_hash
from models.models import db, User, Hotel, Room, Booking, Payment
from services.metrics_service import ACTIVE_ROOMS_GAUGE, USERS_TOTAL_GAUGE

logger = logging.getLogger(__name__)

def check_db_health():
    """Validates database ping/connectivity"""
    try:
        db.session.execute(db.text('SELECT 1'))
        return True, "Database connected"
    except Exception as e:
        return False, str(e)

def seed_sample_data_if_empty():
    """
    Ensures that if the database is newly initialized,
    it automatically populates with 8+ hotels, rooms, and sample users
    for seamless demonstration.
    """
    try:
        user_count = User.query.count()
        if user_count > 0:
            logger.info("Database already initialized with data.")
            update_live_gauges()
            return

        logger.info("Empty database detected. Seeding StayEase demo dataset...")

        # 1. Users
        admin = User(
            name='System Administrator',
            email='admin@stayease.com',
            phone='+91 9876543210',
            password_hash=generate_password_hash('Admin@123'),
            role='admin'
        )
        user1 = User(
            name='John Doe',
            email='john@example.com',
            phone='+91 9812345678',
            password_hash=generate_password_hash('User@123'),
            role='user'
        )
        user2 = User(
            name='Priya Sharma',
            email='priya@example.com',
            phone='+91 9765432109',
            password_hash=generate_password_hash('User@123'),
            role='user'
        )
        db.session.add_all([admin, user1, user2])
        db.session.commit()

        # 2. Hotels
        hotels_data = [
            {
                "name": "The Grand Palace Hotel",
                "location": "Mumbai",
                "address": "Marine Drive, Nariman Point, Mumbai, Maharashtra 400021",
                "description": "An iconic 5-star seaside landmark featuring majestic Arabian Sea vistas, bespoke butler service, Michelin-inspired coastal dining, and world-class spa facilities.",
                "rating": 4.9,
                "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                "facilities": "Free Wi-Fi, Valet Parking, Oceanfront Restaurant, Infinity Pool, 24/7 Room Service, Air Conditioning, Spa & Wellness, 24/7 Reception, Sea View",
                "rooms": [
                    {
                        "room_type": "Deluxe Sea View Room",
                        "price": 7500.00,
                        "capacity": 2,
                        "bed_type": "King Bed",
                        "description": "Spacious 420 sq.ft room with floor-to-ceiling windows overlooking the Arabian Sea, marble bathroom, and rain shower.",
                        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 12
                    },
                    {
                        "room_type": "Executive Suite",
                        "price": 13500.00,
                        "capacity": 3,
                        "bed_type": "King Bed + Sofa Bed",
                        "description": "Luxurious 700 sq.ft suite featuring a separate living lounge, panoramic sea panorama, walk-in closet, and club lounge access.",
                        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 6
                    },
                    {
                        "room_type": "Presidential Ocean Villa Suite",
                        "price": 24000.00,
                        "capacity": 4,
                        "bed_type": "2 King Beds",
                        "description": "The pinnacle of luxury with private terrace, personal butler service, whirlpool jacuzzi, and master boardroom dining.",
                        "image": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 2
                    }
                ]
            },
            {
                "name": "Ocean Breeze Luxury Resort",
                "location": "Goa",
                "address": "Candolim Beach Road, North Goa, Goa 403515",
                "description": "A tropical beachfront paradise with direct private beach access, poolside cocktail cabanas, water sports activities, and serene palm-fringed tropical gardens.",
                "rating": 4.8,
                "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
                "facilities": "Free Wi-Fi, Free Parking, Beachside Bar & Grill, Swimming Pool, Room Service, Air Conditioning, Water Sports, Airport Shuttle, Private Beach",
                "rooms": [
                    {
                        "room_type": "Garden View Deluxe",
                        "price": 5200.00,
                        "capacity": 2,
                        "bed_type": "Queen Bed",
                        "description": "Bright and airy beach-style room opening directly onto manicured tropical lawns with private patio seating.",
                        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 15
                    },
                    {
                        "room_type": "Beachfront Pool Villa",
                        "price": 9800.00,
                        "capacity": 3,
                        "bed_type": "King Bed",
                        "description": "Exclusive villa steps from the sand, featuring a private plunge pool, outdoor open-sky shower, and sunset deck.",
                        "image": "https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 8
                    }
                ]
            },
            {
                "name": "Royal Heritage Haveli",
                "location": "Jaipur",
                "address": "Amer Road, Pink City, Jaipur, Rajasthan 302002",
                "description": "A meticulously restored 18th-century Rajput palace offering authentic royal hospitality, handcrafted carved jharokhas, traditional folk dance evenings, and rooftop dining.",
                "rating": 4.9,
                "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
                "facilities": "Free Wi-Fi, Traditional Dining, Heritage Courtyard, Swimming Pool, Air Conditioning, Cultural Shows, 24/7 Reception, Guided Tours",
                "rooms": [
                    {
                        "room_type": "Heritage Royal Room",
                        "price": 6200.00,
                        "capacity": 2,
                        "bed_type": "King Bed",
                        "description": "Adorned with hand-painted fresco murals, antique teak furniture, stained glass archways, and modern luxury amenities.",
                        "image": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 10
                    },
                    {
                        "room_type": "Maharaja Courtyard Suite",
                        "price": 11500.00,
                        "capacity": 4,
                        "bed_type": "Royal Canopy Bed",
                        "description": "Palatial suite overlooking the central fountain courtyard, with hand-woven silk drapery and carved marble bath.",
                        "image": "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 4
                    }
                ]
            },
            {
                "name": "Pine Forest Alpine Retreat",
                "location": "Manali",
                "address": "Old Manali Hills, Manali, Himachal Pradesh 175131",
                "description": "Perched amidst cedar woods and snow-capped Himalayan peaks, this luxury wooden chalet retreat features roaring fireplaces, heated indoor pools, and balcony mountain panoramas.",
                "rating": 4.7,
                "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
                "facilities": "Free Wi-Fi, Mountain View, Heated Pool, In-house Cafe, Bonfire Nights, 24/7 Reception, Heating, Trekking Guides",
                "rooms": [
                    {
                        "room_type": "Cedar Valley Classic",
                        "price": 4200.00,
                        "capacity": 2,
                        "bed_type": "Queen Bed",
                        "description": "Cozy pinewood room featuring a private scenic balcony facing the snow-capped Rohtang peaks and pine forests.",
                        "image": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 14
                    },
                    {
                        "room_type": "Alpine Chalet Fireplace Suite",
                        "price": 7800.00,
                        "capacity": 3,
                        "bed_type": "King Bed",
                        "description": "Warm timber suite featuring an authentic stone wood-burning fireplace, plush fur throws, and panoramic alpine windows.",
                        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 5
                    }
                ]
            },
            {
                "name": "Silicon Tech Oasis Hotel",
                "location": "Bangalore",
                "address": "Outer Ring Road, Bellandur, Bangalore, Karnataka 560103",
                "description": "A cutting-edge urban sanctuary designed for discerning business and leisure travelers, featuring ultra-fast gigabit fiber, ergonomic workspaces, rooftop microbrewery, and gym.",
                "rating": 4.6,
                "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
                "facilities": "High-Speed Wi-Fi, Business Center, Rooftop Brewery, Fitness Center, 24/7 Room Service, Air Conditioning, EV Charging, Airport Shuttle",
                "rooms": [
                    {
                        "room_type": "Smart Business Studio",
                        "price": 4800.00,
                        "capacity": 2,
                        "bed_type": "King Bed",
                        "description": "Ergonomically designed with Herman Miller workstation, 65-inch 4K smart TV, smart home automation, and soundproof glass.",
                        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 20
                    },
                    {
                        "room_type": "Club Executive Room",
                        "price": 6900.00,
                        "capacity": 2,
                        "bed_type": "King Bed",
                        "description": "High floor corner room with city skyline views, espresso bar, evening complimentary cocktails, and express laundry.",
                        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 8
                    }
                ]
            },
            {
                "name": "Lake Pichola Palace Hotel",
                "location": "Udaipur",
                "address": "Haridas Ji Ki Magri, Udaipur, Rajasthan 313001",
                "description": "Floating right along the shimmering waters of Lake Pichola, this magical romantic retreat offers majestic views of City Palace, sunset boat cruises, and royal dining.",
                "rating": 4.9,
                "image": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
                "facilities": "Free Wi-Fi, Lakeside Dining, Boat Transfers, Infinity Pool, Butler Service, Air Conditioning, Spa, 24/7 Concierge",
                "rooms": [
                    {
                        "room_type": "Lakeside Palace Room",
                        "price": 8900.00,
                        "capacity": 2,
                        "bed_type": "King Bed",
                        "description": "Panoramic windows over the calm waters of Lake Pichola with views of sunset over the Aravalli mountains.",
                        "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 9
                    },
                    {
                        "room_type": "Royal Mewar Sunset Suite",
                        "price": 16500.00,
                        "capacity": 3,
                        "bed_type": "King Canopy Bed",
                        "description": "Spectacular waterfront suite with private jharokha balcony, marble soaking tub, and afternoon high-tea service.",
                        "image": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 3
                    }
                ]
            },
            {
                "name": "Emerald Backwaters Resort & Spa",
                "location": "Kerala",
                "address": "Kumarakom Backwaters, Kottayam, Kerala 686563",
                "description": "An idyllic eco-luxury sanctuary nestled along the tranquil Vembanad Lake backwaters, featuring private plunge pools, authentic Ayurvedic therapies, and houseboat cruises.",
                "rating": 4.8,
                "image": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80",
                "facilities": "Free Wi-Fi, Ayurvedic Spa, Houseboat Tours, Lakeside Pool, Organic Restaurant, Air Conditioning, Fishing & Kayaking",
                "rooms": [
                    {
                        "room_type": "Lagoon View Cottage",
                        "price": 6500.00,
                        "capacity": 2,
                        "bed_type": "King Bed",
                        "description": "Thatched-roof luxury cottage situated directly over tranquil lotus canals, with private deck and teakwood interiors.",
                        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 10
                    },
                    {
                        "room_type": "Waterfront Pool Villa",
                        "price": 12000.00,
                        "capacity": 4,
                        "bed_type": "2 King Beds",
                        "description": "Spacious family haven with private freshwater plunge pool, outdoor hammock garden, and private canoe dock.",
                        "image": "https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 4
                    }
                ]
            },
            {
                "name": "The Imperial Diplomat",
                "location": "New Delhi",
                "address": "Janpath, Connaught Place, New Delhi 110001",
                "description": "A legendary colonial architectural masterpiece offering timeless aristocratic elegance, art deco galleries, award-winning multi-cuisine restaurants, and premier luxury suites.",
                "rating": 4.7,
                "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
                "facilities": "Free Wi-Fi, Valet Parking, Fine Dining Restaurants, Spa & Salon, Swimming Pool, Air Conditioning, Concierge Service, 24/7 Reception",
                "rooms": [
                    {
                        "room_type": "Heritage Deluxe Suite",
                        "price": 7200.00,
                        "capacity": 2,
                        "bed_type": "King Bed",
                        "description": "Gracefully decorated with classical British-Indian colonial aesthetics, high ceilings, Italian marble bath, and minibar.",
                        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 15
                    },
                    {
                        "room_type": "Presidential Diplomatic Suite",
                        "price": 15000.00,
                        "capacity": 3,
                        "bed_type": "King Bed",
                        "description": "Exclusive high-security luxury suite frequently hosting diplomats and executives, with private study and reception foyer.",
                        "image": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
                        "total_quantity": 4
                    }
                ]
            }
        ]

        for h_data in hotels_data:
            rooms_list = h_data.pop("rooms")
            hotel = Hotel(**h_data)
            db.session.add(hotel)
            db.session.flush() # get hotel.id

            for r_data in rooms_list:
                room = Room(hotel_id=hotel.id, **r_data)
                db.session.add(room)

        db.session.commit()

        # 3. Add initial sample bookings and payments for analytics
        b1 = Booking(
            booking_id='SE-BKG-8021',
            user_id=user1.id,
            hotel_id=1,
            room_id=1,
            check_in=date(2026, 10, 10),
            check_out=date(2026, 10, 13),
            guests=2,
            guest_name='John Doe',
            guest_email='john@example.com',
            guest_phone='+91 9812345678',
            special_requests='High floor sea view room requested please.',
            nights=3,
            room_price=7500.00,
            tax_amount=2700.00,
            total_amount=25200.00,
            status='confirmed',
            booking_date=datetime(2026, 9, 18, 10, 30, 0)
        )
        db.session.add(b1)
        db.session.flush()

        p1 = Payment(
            booking_id=b1.id,
            payment_method='card',
            amount=25200.00,
            payment_status='successful',
            transaction_reference='TXN-CARD-901849204',
            payment_date=datetime(2026, 9, 18, 10, 32, 15)
        )
        db.session.add(p1)

        b2 = Booking(
            booking_id='SE-BKG-8022',
            user_id=user2.id,
            hotel_id=2,
            room_id=5,
            check_in=date(2026, 10, 15),
            check_out=date(2026, 10, 18),
            guests=2,
            guest_name='Priya Sharma',
            guest_email='priya@example.com',
            guest_phone='+91 9765432109',
            special_requests='Honeymoon arrangement, late check-in at 8 PM.',
            nights=3,
            room_price=9800.00,
            tax_amount=3528.00,
            total_amount=32928.00,
            status='confirmed',
            booking_date=datetime(2026, 9, 19, 14, 15, 0)
        )
        db.session.add(b2)
        db.session.flush()

        p2 = Payment(
            booking_id=b2.id,
            payment_method='upi',
            amount=32928.00,
            payment_status='successful',
            transaction_reference='TXN-UPI-774910284',
            payment_date=datetime(2026, 9, 19, 14, 17, 30)
        )
        db.session.add(p2)

        db.session.commit()
        logger.info("Successfully seeded StayEase sample data.")
        update_live_gauges()

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error seeding sample data: {e}")

def update_live_gauges():
    """Updates Prometheus gauge metrics with real database counts"""
    try:
        total_rooms = Room.query.filter_by(availability=True).count()
        total_users = User.query.count()
        ACTIVE_ROOMS_GAUGE.set(total_rooms)
        USERS_TOTAL_GAUGE.set(total_users)
    except Exception:
        pass
