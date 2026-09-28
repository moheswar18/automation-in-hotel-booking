import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState(null);

  // Simulated payment fields
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4532 •••• •••• 8921',
    expiry: '12/28',
    cvv: '888',
    cardName: 'John Doe',
  });
  const [upiId, setUpiId] = useState('user@okaxis');
  const [bank, setBank] = useState('HDFC Bank');

  useEffect(() => {
    api.bookings.getById(bookingId)
      .then((res) => {
        if (res.success && res.booking) {
          setBooking(res.booking);
        } else {
          setError('Booking reservation details not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePayNow = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.payments.process({
        booking_id: parseInt(bookingId),
        payment_method: paymentMethod,
      });

      if (res.success) {
        navigate(`/confirmation/${bookingId}`, {
          state: {
            transactionReference: res.transaction_reference,
            confirmedBooking: res.booking,
          }
        });
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-xl mx-auto px-4 py-20 text-center text-slate-500">Initializing secure payment gateway...</div>;
  }

  if (error && !booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-xl font-bold">{error}</h2>
        <button onClick={() => navigate('/hotels')} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8 space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 2 of 2: Simulated Checkout</span>
        <h1 className="text-3xl font-black text-slate-900">Secure Payment Simulation</h1>
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 py-1.5 px-4 rounded-full inline-block font-semibold">
          Academic Demo Mode: Test credentials only. No real bank charges will occur.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Reservation summary banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Booking Reference</span>
            <span className="text-lg font-mono font-bold text-blue-400">{booking?.booking_id}</span>
            <p className="text-xs text-slate-300 mt-1">{booking?.hotel_name} • {booking?.room_type}</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Amount to Pay</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              ₹{Number(booking?.total_amount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Payment Methods Selector */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
              { id: 'upi', label: 'UPI / QR Code', icon: '📱' },
              { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                  paymentMethod === method.id
                    ? 'border-blue-600 bg-blue-50/50 text-blue-600 font-bold shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-xl">{method.icon}</span>
                <span className="text-xs">{method.label}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handlePayNow} className="space-y-4">
            {/* Card Fields */}
            {paymentMethod === 'card' && (
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Card Number (Demo)
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI Fields */}
            {paymentMethod === 'upi' && (
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Virtual Payment Address (UPI ID)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <span>📱</span>
                  <span>Instant UPI collect request will be simulated on confirmation.</span>
                </div>
              </div>
            )}

            {/* Net Banking */}
            {paymentMethod === 'netbanking' && (
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Select Bank
                  </label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 text-sm transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Processing Payment Simulation...</span>
                </>
              ) : (
                <>
                  <span>🔒</span>
                  <span>Pay ₹{Number(booking?.total_amount || 0).toLocaleString('en-IN')} & Confirm Reservation</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
