import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const BookingPage = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkOutDefault = new Date(tomorrow);
  checkOutDefault.setDate(checkOutDefault.getDate() + 2);

  const [formData, setFormData] = useState({
    check_in: tomorrow.toISOString().split('T')[0],
    check_out: checkOutDefault.toISOString().split('T')[0],
    guests: 2,
    guest_name: user?.name || '',
    guest_email: user?.email || '',
    guest_phone: user?.phone || '',
    special_requests: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    Promise.all([api.hotels.getById(hotelId), api.rooms.getByHotelId(hotelId)])
      .then(([hotelRes, roomRes]) => {
        setHotel(hotelRes.hotel);
        const selectedRoom = (roomRes.rooms || []).find((r) => r.id === parseInt(roomId));
        if (!selectedRoom) {
          setError('Selected room not found');
        } else {
          setRoom(selectedRoom);
          setFormData((prev) => ({
            ...prev,
            guests: Math.min(prev.guests, selectedRoom.capacity),
            guest_name: user?.name || '',
            guest_email: user?.email || '',
            guest_phone: user?.phone || '',
          }));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [hotelId, roomId, isAuthenticated, user]);

  // Price calculations
  const calculateNights = () => {
    const start = new Date(formData.check_in);
    const end = new Date(formData.check_out);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const roomPrice = room ? room.price : 0;
  const basePrice = roomPrice * nights;
  const taxAmount = Math.round(basePrice * 0.12);
  const totalAmount = basePrice + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        hotel_id: parseInt(hotelId),
        room_id: parseInt(roomId),
        check_in: formData.check_in,
        check_out: formData.check_out,
        guests: parseInt(formData.guests),
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone,
        special_requests: formData.special_requests,
      };

      const res = await api.bookings.create(payload);
      if (res.success && res.booking) {
        // Direct user to simulated payment screen
        navigate(`/payment/${res.booking.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">Loading booking details...</div>;
  }

  if (error && !room) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-xl font-bold">{error}</h2>
        <button onClick={() => navigate('/hotels')} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Back to Hotels
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 1 of 2: Reservation Details</span>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Complete Your Booking</h1>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Guest Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Guest Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Primary Guest Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.guest_email}
                  onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.guest_phone}
                  onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Number of Guests
                </label>
                <select
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {Array.from({ length: room?.capacity || 2 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 pt-4">
              Schedule & Requests
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.check_in}
                  min={today.toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.check_out}
                  min={formData.check_in}
                  onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Special Requests (Optional)
              </label>
              <textarea
                rows="3"
                placeholder="High floor, late arrival, airport transfer, dietary notes..."
                value={formData.special_requests}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 text-sm transition"
            >
              {submitting ? 'Creating Reservation...' : 'Proceed to Payment (Simulated)'}
            </button>
          </form>
        </div>

        {/* Right Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-28 space-y-6">
            <h3 className="font-bold text-base text-slate-900">Booking Summary</h3>

            {/* Hotel & Room snippet */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <img
                src={room?.image || hotel?.image}
                alt={hotel?.name}
                className="w-full h-36 object-cover rounded-2xl"
              />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{hotel?.name}</h4>
                <p className="text-xs text-slate-500">{hotel?.location}</p>
                <p className="text-xs font-semibold text-blue-600 mt-1">{room?.room_type}</p>
              </div>
            </div>

            {/* Stay Details */}
            <div className="space-y-2 text-xs text-slate-600 pb-4 border-b border-slate-100">
              <div className="flex justify-between">
                <span>Check-in:</span>
                <strong className="text-slate-800">{formData.check_in}</strong>
              </div>
              <div className="flex justify-between">
                <span>Check-out:</span>
                <strong className="text-slate-800">{formData.check_out}</strong>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <strong className="text-slate-800">{nights} {nights === 1 ? 'night' : 'nights'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Guests:</span>
                <strong className="text-slate-800">{formData.guests}</strong>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>₹{Number(roomPrice).toLocaleString('en-IN')} × {nights} nights:</span>
                <span className="font-semibold text-slate-800">₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST (12%):</span>
                <span className="font-semibold text-slate-800">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-200 text-sm">
                <span className="font-black text-slate-900">Total Payable:</span>
                <span className="font-black text-blue-600 text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
