import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export const BookingConfirmPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.confirmedBooking || null);
  const [txRef, setTxRef] = useState(location.state?.transactionReference || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    if (!booking) {
      api.bookings.getById(bookingId)
        .then((res) => {
          if (res.success && res.booking) {
            setBooking(res.booking);
            if (res.booking.payment) {
              setTxRef(res.booking.payment.transaction_reference);
            }
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [bookingId, booking]);

  if (loading) {
    return <div className="max-w-xl mx-auto px-4 py-20 text-center text-slate-500">Retrieving confirmed booking record...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-8 text-center space-y-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-3xl mx-auto">
            ✓
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Booking Confirmed Successfully!
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-md mx-auto">
            Thank you for choosing StayEase. Your room reservation has been secured and confirmed.
          </p>
        </div>

        {/* Voucher Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Reference Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-2xl border border-slate-200 gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Booking ID
              </span>
              <span className="text-xl font-black font-mono text-blue-600">
                {booking?.booking_id}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Status
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                ● Confirmed
              </span>
            </div>
          </div>

          {/* Hotel & Guest Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Hotel Reservation
              </h3>
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                <h4 className="font-bold text-base text-slate-900">{booking?.hotel_name}</h4>
                <p className="text-xs text-slate-500">{booking?.hotel_location}</p>
                <p className="text-xs font-semibold text-blue-600">{booking?.room_type}</p>
                <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <strong className="text-slate-800">{booking?.check_in}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <strong className="text-slate-800">{booking?.check_out}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <strong className="text-slate-800">{booking?.nights} Nights</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Guest & Payment
              </h3>
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                <h4 className="font-bold text-base text-slate-900">{booking?.guest_name}</h4>
                <p className="text-xs text-slate-500">{booking?.guest_email} • {booking?.guest_phone}</p>
                <p className="text-xs text-slate-600">{booking?.guests} Registered Guests</p>
                <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Total Amount Paid:</span>
                    <strong className="text-slate-900 font-black">₹{Number(booking?.total_amount || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  {txRef && (
                    <div className="flex justify-between">
                      <span>Transaction Ref:</span>
                      <span className="font-mono text-[11px] text-blue-600">{txRef}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3 print:hidden">
            <Link
              to="/my-bookings"
              className="flex-1 text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
            >
              View in My Bookings
            </Link>
            <button
              onClick={() => window.print()}
              className="px-5 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition"
            >
              Print Voucher
            </button>
            <Link
              to="/hotels"
              className="px-5 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition text-center"
            >
              Explore More Hotels
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
