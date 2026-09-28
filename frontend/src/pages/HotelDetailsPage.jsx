import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const HotelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.hotels.getById(id)
      .then((res) => {
        if (res.success && res.hotel) {
          setHotel(res.hotel);
        } else {
          setError('Hotel details could not be retrieved');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookRoom = (room) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/hotels/${id}`);
      return;
    }
    navigate(`/book/${hotel.id}/${room.id}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-96 bg-slate-200 animate-pulse rounded-3xl mb-8"></div>
        <div className="h-10 bg-slate-200 animate-pulse w-1/3 rounded-lg mb-4"></div>
        <div className="h-20 bg-slate-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-4xl">❌</span>
        <h2 className="text-2xl font-bold text-slate-800">Hotel Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'The requested hotel does not exist or has been removed.'}</p>
        <button
          onClick={() => navigate('/hotels')}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm"
        >
          Return to Hotel Catalog
        </button>
      </div>
    );
  }

  const facilitiesList = Array.isArray(hotel.facilities)
    ? hotel.facilities
    : (hotel.facilities || '').split(',').map((f) => f.trim()).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hotel Title & Header Meta */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
              {hotel.location}
            </span>
            <div className="flex items-center text-amber-500 text-xs font-black">
              ★ {Number(hotel.rating).toFixed(1)} <span className="text-slate-400 font-normal ml-1">(Verified Luxury)</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {hotel.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {hotel.address || `${hotel.location}, India`}
          </p>
        </div>

        <div className="text-left md:text-right">
          <span className="text-xs text-slate-400 block">Starting from</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-600">
            ₹{Number(hotel.starting_price || 4200).toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-500"> /night + taxes</span>
        </div>
      </div>

      {/* Hotel Hero Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[440px]">
        <div className="md:col-span-2 h-full rounded-3xl overflow-hidden shadow-sm bg-slate-100">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-4 h-full">
          <div className="rounded-3xl overflow-hidden shadow-sm bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
              alt="Room Suite"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-3xl overflow-hidden shadow-sm bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
              alt="Hotel Pool"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Description & Facilities Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">About the Property</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {hotel.description}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Hotel Amenities & Facilities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {facilitiesList.map((facility, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>{facility}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Highlights Card */}
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 h-fit space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Stay Highlights</h3>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Instant Confirmation with Booking Code</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Free Cancellation up to 24 hours prior</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>24/7 Front Desk & Luggage Storage</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>High-speed Gigabit Optical Fiber Wi-Fi</span>
            </li>
          </ul>

          <a
            href="#rooms"
            className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition"
          >
            Jump to Available Rooms
          </a>
        </div>
      </div>

      {/* Available Rooms Section */}
      <div id="rooms" className="space-y-6 pt-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Accommodations</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Available Room Types</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(hotel.rooms || []).map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={room.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                  alt={room.room_type}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800">
                  Capacity: {room.capacity} Guests
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-base text-slate-900">{room.room_type}</h3>
                  </div>
                  <p className="text-xs text-blue-600 font-semibold mb-2">{room.bed_type}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{room.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Rate per night</span>
                    <span className="text-lg font-black text-slate-900">
                      ₹{Number(room.price).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBookRoom(room)}
                    disabled={!room.availability}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition shadow-sm ${
                      room.availability
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {room.availability ? 'Select Room' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
