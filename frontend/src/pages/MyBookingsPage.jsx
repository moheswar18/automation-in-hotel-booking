import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.bookings.getAll();
      setBookings(res.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to load your reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/my-bookings');
      return;
    }
    fetchBookings();
  }, [isAuthenticated]);

  const handleCancelBooking = async (id, bookingCode) => {
    if (!window.confirm(`Are you sure you want to cancel reservation ${bookingCode}?`)) {
      return;
    }

    try {
      const res = await api.bookings.updateStatus(id, 'cancelled');
      if (res.success) {
        setActionSuccess(`Reservation ${bookingCode} was successfully cancelled.`);
        fetchBookings();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel reservation');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">● Confirmed</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">✓ Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">✕ Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Account History</span>
        <h1 className="text-3xl font-black text-slate-900 mt-1">My Hotel Reservations</h1>
        <p className="text-xs text-slate-500 mt-1">Review your upcoming stays, past bookings, and cancellations.</p>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold">
          {actionSuccess}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-10 text-center bg-white rounded-3xl border border-red-100 space-y-3">
          <p className="text-xs text-red-600 font-medium">{error}</p>
          <button onClick={fetchBookings} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
            Retry
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <span className="text-4xl">🧳</span>
          <h3 className="font-bold text-slate-800 text-lg">No Reservations Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't booked any hotel stays yet. Discover luxury destinations and book your getaway today!
          </p>
          <Link
            to="/hotels"
            className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            Find Hotels
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              {/* Hotel & Reservation Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={booking.hotel_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'}
                  alt={booking.hotel_name}
                  className="w-20 h-20 object-cover rounded-xl shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {booking.booking_id}
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{booking.hotel_name}</h3>
                  <p className="text-xs text-slate-500">{booking.room_type} • {booking.guests} Guests</p>
                  <p className="text-[11px] text-slate-400">
                    Stay: {booking.check_in} to {booking.check_out} ({booking.nights} nights)
                  </p>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 gap-3">
                <div className="text-left md:text-right">
                  <span className="text-[11px] text-slate-400 block">Total Price</span>
                  <span className="text-lg font-black text-slate-900">
                    ₹{Number(booking.total_amount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/confirmation/${booking.id}`}
                    className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition"
                  >
                    View Voucher
                  </Link>
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id, booking.booking_id)}
                      className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
