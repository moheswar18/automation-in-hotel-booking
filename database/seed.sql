-- ==============================================================================
-- Realistic Sample Data Seed for StayEase Hotel Booking System
-- ==============================================================================

USE stayease_db;

-- -----------------------------------------------------------------------------
-- 1. Users (Admin and Demo Customers)
-- Passwords:
-- admin@stayease.com -> Admin@123 (bcrypt hash)
-- john@example.com   -> User@123  (bcrypt hash)
-- priya@example.com  -> User@123  (bcrypt hash)
-- -----------------------------------------------------------------------------
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
(1, 'System Administrator', 'admin@stayease.com', '+91 9876543210', '$2b$12$e8Y2lQ7K1p1E3ZkFm5u5Aec0y5eI3iXy2Yd0gBfW8Zt3M2uL7q8vS', 'admin'),
(2, 'John Doe', 'john@example.com', '+91 9812345678', '$2b$12$YcEwRk5o3xT7eA6mB4vNRe7K5c3o2f1u8X0y1Za5W4t2L1uK8p7vT', 'user'),
(3, 'Priya Sharma', 'priya@example.com', '+91 9765432109', '$2b$12$YcEwRk5o3xT7eA6mB4vNRe7K5c3o2f1u8X0y1Za5W4t2L1uK8p7vT', 'user');

-- -----------------------------------------------------------------------------
-- 2. Hotels (8+ Premium Properties Across Popular Destinations)
-- -----------------------------------------------------------------------------
INSERT INTO hotels (id, name, location, address, description, rating, image, facilities) VALUES
(1, 'The Grand Palace Hotel', 'Mumbai', 'Marine Drive, Nariman Point, Mumbai, Maharashtra 400021', 
'An iconic 5-star seaside landmark featuring majestic Arabian Sea vistas, bespoke butler service, Michelin-inspired coastal dining, and world-class spa facilities.', 
4.9, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 
'Free Wi-Fi, Valet Parking, Oceanfront Restaurant, Infinity Pool, 24/7 Room Service, Air Conditioning, Spa & Wellness, 24/7 Reception, Sea View'),

(2, 'Ocean Breeze Luxury Resort', 'Goa', 'Candolim Beach Road, North Goa, Goa 403515', 
'A tropical beachfront paradise with direct private beach access, poolside cocktail cabanas, water sports activities, and serene palm-fringed tropical gardens.', 
4.8, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80', 
'Free Wi-Fi, Free Parking, Beachside Bar & Grill, Swimming Pool, Room Service, Air Conditioning, Water Sports, Airport Shuttle, Private Beach'),

(3, 'Royal Heritage Haveli', 'Jaipur', 'Amer Road, Pink City, Jaipur, Rajasthan 302002', 
'A meticulously restored 18th-century Rajput palace offering authentic royal hospitality, handcrafted carved jharokhas, traditional folk dance evenings, and rooftop dining.', 
4.9, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', 
'Free Wi-Fi, Traditional Dining, Heritage Courtyard, Swimming Pool, Air Conditioning, Cultural Shows, 24/7 Reception, Guided Tours'),

(4, 'Pine Forest Alpine Retreat', 'Manali', 'Old Manali Hills, Manali, Himachal Pradesh 175131', 
'Perched amidst cedar woods and snow-capped Himalayan peaks, this luxury wooden chalet retreat features roaring fireplaces, heated indoor pools, and balcony mountain panoramas.', 
4.7, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', 
'Free Wi-Fi, Mountain View, Heated Pool, In-house Cafe, Bonfire Nights, 24/7 Reception, Heating, Trekking Guides'),

(5, 'Silicon Tech Oasis Hotel', 'Bangalore', 'Outer Ring Road, Bellandur, Bangalore, Karnataka 560103', 
'A cutting-edge urban sanctuary designed for discerning business and leisure travelers, featuring ultra-fast gigabit fiber, ergonomic workspaces, rooftop microbrewery, and gym.', 
4.6, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80', 
'High-Speed Wi-Fi, Business Center, Rooftop Brewery, Fitness Center, 24/7 Room Service, Air Conditioning, EV Charging, Airport Shuttle'),

(6, 'Lake Pichola Palace Hotel', 'Udaipur', 'Haridas Ji Ki Magri, Udaipur, Rajasthan 313001', 
'Floating right along the shimmering waters of Lake Pichola, this magical romantic retreat offers majestic views of City Palace, sunset boat cruises, and royal dining.', 
4.9, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', 
'Free Wi-Fi, Lakeside Dining, Boat Transfers, Infinity Pool, Butler Service, Air Conditioning, Spa, 24/7 Concierge'),

(7, 'Emerald Backwaters Resort & Spa', 'Kerala', 'Kumarakom Backwaters, Kottayam, Kerala 686563', 
'An idyllic eco-luxury sanctuary nestled along the tranquil Vembanad Lake backwaters, featuring private plunge pools, authentic Ayurvedic therapies, and houseboat cruises.', 
4.8, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80', 
'Free Wi-Fi, Ayurvedic Spa, Houseboat Tours, Lakeside Pool, Organic Restaurant, Air Conditioning, Fishing & Kayaking'),

(8, 'The Imperial Diplomat', 'New Delhi', 'Janpath, Connaught Place, New Delhi 110001', 
'A legendary colonial architectural masterpiece offering timeless aristocratic elegance, art deco galleries, award-winning multi-cuisine restaurants, and premier luxury suites.', 
4.7, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', 
'Free Wi-Fi, Valet Parking, Fine Dining Restaurants, Spa & Salon, Swimming Pool, Air Conditioning, Concierge Service, 24/7 Reception');

-- -----------------------------------------------------------------------------
-- 3. Rooms (Multiple Room Tiers Per Hotel)
-- -----------------------------------------------------------------------------
INSERT INTO rooms (id, hotel_id, room_type, price, capacity, bed_type, description, image, availability, total_quantity) VALUES
-- The Grand Palace Hotel (Mumbai)
(1, 1, 'Deluxe Sea View Room', 7500.00, 2, 'King Bed', 'Spacious 420 sq.ft room with floor-to-ceiling windows overlooking the Arabian Sea, marble bathroom, and rain shower.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', TRUE, 12),
(2, 1, 'Executive Suite', 13500.00, 3, 'King Bed + Sofa Bed', 'Luxurious 700 sq.ft suite featuring a separate living lounge, panoramic sea panorama, walk-in closet, and club lounge access.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', TRUE, 6),
(3, 1, 'Presidential Ocean Villa Suite', 24000.00, 4, '2 King Beds', 'The pinnacle of luxury with private terrace, personal butler service, whirlpool jacuzzi, and master boardroom dining.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', TRUE, 2),

-- Ocean Breeze Luxury Resort (Goa)
(4, 2, 'Garden View Deluxe', 5200.00, 2, 'Queen Bed', 'Bright and airy beach-style room opening directly onto manicured tropical lawns with private patio seating.', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', TRUE, 15),
(5, 2, 'Beachfront Pool Villa', 9800.00, 3, 'King Bed', 'Exclusive villa steps from the sand, featuring a private plunge pool, outdoor open-sky shower, and sunset deck.', 'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&w=800&q=80', TRUE, 8),

-- Royal Heritage Haveli (Jaipur)
(6, 3, 'Heritage Royal Room', 6200.00, 2, 'King Bed', 'Adorned with hand-painted fresco murals, antique teak furniture, stained glass archways, and modern luxury amenities.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', TRUE, 10),
(7, 3, 'Maharaja Courtyard Suite', 11500.00, 4, 'Royal Canopy Bed', 'Palatial suite overlooking the central fountain courtyard, with hand-woven silk drapery and carved marble bath.', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80', TRUE, 4),

-- Pine Forest Alpine Retreat (Manali)
(8, 4, 'Cedar Valley Classic', 4200.00, 2, 'Queen Bed', 'Cozy pinewood room featuring a private scenic balcony facing the snow-capped Rohtang peaks and pine forests.', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80', TRUE, 14),
(9, 4, 'Alpine Chalet Fireplace Suite', 7800.00, 3, 'King Bed', 'Warm timber suite featuring an authentic stone wood-burning fireplace, plush fur throws, and panoramic alpine windows.', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', TRUE, 5),

-- Silicon Tech Oasis Hotel (Bangalore)
(10, 5, 'Smart Business Studio', 4800.00, 2, 'King Bed', 'Ergonomically designed with Herman Miller workstation, 65-inch 4K smart TV, smart home automation, and soundproof glass.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', TRUE, 20),
(11, 5, 'Club Executive Room', 6900.00, 2, 'King Bed', 'High floor corner room with city skyline views, espresso bar, evening complimentary cocktails, and express laundry.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', TRUE, 8),

-- Lake Pichola Palace Hotel (Udaipur)
(12, 6, 'Lakeside Palace Room', 8900.00, 2, 'King Bed', 'Panoramic windows over the calm waters of Lake Pichola with views of sunset over the Aravalli mountains.', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', TRUE, 9),
(13, 6, 'Royal Mewar Sunset Suite', 16500.00, 3, 'King Canopy Bed', 'Spectacular waterfront suite with private jharokha balcony, marble soaking tub, and afternoon high-tea service.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', TRUE, 3),

-- Emerald Backwaters Resort (Kerala)
(14, 7, 'Lagoon View Cottage', 6500.00, 2, 'King Bed', 'Thatched-roof luxury cottage situated directly over tranquil lotus canals, with private deck and teakwood interiors.', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', TRUE, 10),
(15, 7, 'Waterfront Pool Villa', 12000.00, 4, '2 King Beds', 'Spacious family haven with private freshwater plunge pool, outdoor hammock garden, and private canoe dock.', 'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&w=800&q=80', TRUE, 4),

-- The Imperial Diplomat (New Delhi)
(16, 8, 'Heritage Deluxe Suite', 7200.00, 2, 'King Bed', 'Gracefully decorated with classical British-Indian colonial aesthetics, high ceilings, Italian marble bath, and minibar.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', TRUE, 15),
(17, 8, 'Presidential Diplomatic Suite', 15000.00, 3, 'King Bed', 'Exclusive high-security luxury suite frequently hosting diplomats and executives, with private study and reception foyer.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', TRUE, 4);

-- -----------------------------------------------------------------------------
-- 4. Sample Bookings (Historical and Upcoming for Admin Analytics)
-- -----------------------------------------------------------------------------
INSERT INTO bookings (id, booking_id, user_id, hotel_id, room_id, check_in, check_out, guests, guest_name, guest_email, guest_phone, special_requests, nights, room_price, tax_amount, total_amount, status, booking_date) VALUES
(1, 'SE-BKG-8021', 2, 1, 1, '2026-10-10', '2026-10-13', 2, 'John Doe', 'john@example.com', '+91 9812345678', 'High floor sea view room requested please.', 3, 7500.00, 2700.00, 25200.00, 'confirmed', '2026-09-18 10:30:00'),
(2, 'SE-BKG-8022', 3, 2, 5, '2026-10-15', '2026-10-18', 2, 'Priya Sharma', 'priya@example.com', '+91 9765432109', 'Honeymoon arrangement, late check-in at 8 PM.', 3, 9800.00, 3528.00, 32928.00, 'confirmed', '2026-09-19 14:15:00'),
(3, 'SE-BKG-8023', 2, 4, 8, '2026-11-01', '2026-11-04', 2, 'John Doe', 'john@example.com', '+91 9812345678', 'Airport pickup required.', 3, 4200.00, 1512.00, 14112.00, 'completed', '2026-09-10 09:00:00'),
(4, 'SE-BKG-8024', 3, 3, 6, '2026-10-22', '2026-10-24', 2, 'Priya Sharma', 'priya@example.com', '+91 9765432109', 'Early check-in request.', 2, 6200.00, 1488.00, 13888.00, 'cancelled', '2026-09-15 16:45:00');

-- -----------------------------------------------------------------------------
-- 5. Sample Payments
-- -----------------------------------------------------------------------------
INSERT INTO payments (id, booking_id, payment_method, amount, payment_status, transaction_reference, payment_date) VALUES
(1, 1, 'card', 25200.00, 'successful', 'TXN-CARD-901849204', '2026-09-18 10:32:15'),
(2, 2, 'upi', 32928.00, 'successful', 'TXN-UPI-774910284', '2026-09-19 14:17:30'),
(3, 3, 'netbanking', 14112.00, 'successful', 'TXN-NB-552910481', '2026-09-10 09:02:00'),
(4, 4, 'card', 13888.00, 'successful', 'TXN-CARD-119482910', '2026-09-15 16:47:00');
