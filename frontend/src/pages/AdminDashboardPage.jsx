import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add Hotel Modal state
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [newHotel, setNewHotel] = useState({
    name: '',
    location: '',
    address: '',
    description: '',
    rating: 4.8,
    image: '',
    facilities: 'Free Wi-Fi, Swimming Pool, Room Service, Air Conditioning, Restaurant',
  });

  // Add Room Modal state
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [newRoom, setNewRoom] = useState({
    room_type: '',
    price: '',
    capacity: 2,
    bed_type: 'King Bed',
    description: '',
    image: '',
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, hotelsRes, bookingsRes] = await Promise.all([
        api.admin.getDashboard(),
        api.hotels.getAll(),
        api.bookings.getAll(),
      ]);

      setStats(dashRes.statistics);
      setCharts(dashRes.charts);
      setHotels(hotelsRes.hotels || []);
      setBookings(bookingsRes.bookings || []);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    loadAdminData();
  }, [isAdmin]);

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    try {
      const res = await api.hotels.create(newHotel);
      if (res.success) {
        setShowAddHotelModal(false);
        setNewHotel({
          name: '',
          location: '',
          address: '',
          description: '',
          rating: 4.8,
          image: '',
          facilities: 'Free Wi-Fi, Swimming Pool, Room Service, Air Conditioning, Restaurant',
        });
        loadAdminData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create hotel');
    }
  };

  const handleDeleteHotel = async (hotelId, name) => {
    if (!window.confirm(`Delete "${name}" and all of its rooms?`)) return;
    try {
      await api.hotels.delete(hotelId);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete hotel');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await api.rooms.create({
        hotel_id: parseInt(selectedHotelId),
        ...newRoom,
      });
      if (res.success) {
        setShowAddRoomModal(false);
        setNewRoom({ room_type: '', price: '', capacity: 2, bed_type: 'King Bed', description: '', image: '' });
        loadAdminData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create room');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.bookings.updateStatus(bookingId, newStatus);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.booking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.hotel_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? b.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Central Control Plane
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            System Administration & Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Hotel management, inventory availability, booking telemetry, and cloud operations.
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <span>📊</span>
            <span>Open Grafana</span>
          </a>
          <a
            href="http://localhost:9090"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <span>🔥</span>
            <span>Prometheus Targets</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Dashboard & Charts', icon: '📈' },
          { id: 'hotels', label: 'Hotel Management', icon: '🏨' },
          { id: 'bookings', label: 'All Bookings', icon: '📑' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Total Users', value: stats?.total_users || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Hotels', value: stats?.total_hotels || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Total Rooms', value: stats?.total_rooms || 0, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Total Bookings', value: stats?.total_bookings || 0, color: 'text-cyan-600', bg: 'bg-cyan-50' },
              { label: 'Confirmed', value: stats?.confirmed_bookings || 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Cancelled', value: stats?.cancelled_bookings || 0, color: 'text-red-600', bg: 'bg-red-50' },
              {
                label: 'Total Revenue',
                value: `₹${Number(stats?.total_revenue || 0).toLocaleString('en-IN')}`,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                span: 'col-span-2 sm:col-span-1',
              },
            ].map((kpi, idx) => (
              <div
                key={idx}
                className={`bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1 ${kpi.span || ''}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                  {kpi.label}
                </span>
                <span className={`text-xl font-black ${kpi.color}`}>
                  {kpi.value}
                </span>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bookings Status Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Booking Status Distribution
              </h3>
              <div className="space-y-3 pt-2">
                {(charts?.bookings_by_status || []).map((item, idx) => {
                  const total = stats?.total_bookings || 1;
                  const pct = Math.round((item.value / total) * 100) || 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.name}</span>
                        <span className="text-slate-500">{item.value} ({pct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Destination Popularity */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Top Destinations by Demand
              </h3>
              <div className="space-y-3 pt-2">
                {(charts?.destinations || []).map((dest, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-none">
                    <span className="text-xs font-bold text-slate-800">{dest.location}</span>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                      {dest.bookings} Bookings
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOTEL MANAGEMENT */}
      {activeTab === 'hotels' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Hotel Inventory Catalog</h2>
              <p className="text-xs text-slate-500">Add, edit, or delete managed properties and their rooms.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddHotelModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                + Add Hotel
              </button>
              <button
                onClick={() => setShowAddRoomModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                + Add Room to Hotel
              </button>
            </div>
          </div>

          {/* Hotels Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Hotel</th>
                    <th className="px-6 py-3.5">Destination</th>
                    <th className="px-6 py-3.5">Rating</th>
                    <th className="px-6 py-3.5">Starting Rate</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hotels.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <img
                          src={h.image}
                          alt={h.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <span className="font-bold text-slate-900">{h.name}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{h.location}</td>
                      <td className="px-6 py-4 font-bold text-amber-500">★ {h.rating}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ₹{Number(h.starting_price).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/hotels/${h.id}`)}
                          className="text-blue-600 hover:underline font-bold"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteHotel(h.id, h.name)}
                          className="text-red-600 hover:underline font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALL BOOKINGS MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Reservations Central Register</h2>
              <p className="text-xs text-slate-500">Manage client bookings and update operational status.</p>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by code, guest, hotel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Booking ID</th>
                    <th className="px-6 py-3.5">Hotel & Room</th>
                    <th className="px-6 py-3.5">Guest</th>
                    <th className="px-6 py-3.5">Dates</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">{b.booking_id}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">{b.hotel_name}</span>
                        <span className="text-[11px] text-slate-500">{b.room_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800 block">{b.guest_name}</span>
                        <span className="text-[11px] text-slate-400">{b.guest_phone}</span>
                      </td>
                      <td className="px-6 py-4 text-[11px] text-slate-600">
                        {b.check_in} → {b.check_out} ({b.nights}n)
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ₹{Number(b.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                          className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD HOTEL */}
      {showAddHotelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add New Property</h3>
              <button onClick={() => setShowAddHotelModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateHotel} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Hotel Name</label>
                <input
                  type="text"
                  required
                  value={newHotel.name}
                  onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Destination City</label>
                  <input
                    type="text"
                    required
                    value={newHotel.location}
                    onChange={(e) => setNewHotel({ ...newHotel, location: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newHotel.rating}
                    onChange={(e) => setNewHotel({ ...newHotel, rating: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Address</label>
                <input
                  type="text"
                  value={newHotel.address}
                  onChange={(e) => setNewHotel({ ...newHotel, address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newHotel.image}
                  onChange={(e) => setNewHotel({ ...newHotel, image: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newHotel.description}
                  onChange={(e) => setNewHotel({ ...newHotel, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
              >
                Save Hotel Property
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ROOM */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Room to Hotel</h3>
              <button onClick={() => setShowAddRoomModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Select Hotel</label>
                <select
                  required
                  value={selectedHotelId}
                  onChange={(e) => setSelectedHotelId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                >
                  <option value="">Choose hotel</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} ({h.location})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Room Type</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deluxe Ocean Suite"
                    value={newRoom.room_type}
                    onChange={(e) => setNewRoom({ ...newRoom, room_type: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Nightly Price (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 7500"
                    value={newRoom.price}
                    onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Capacity (Guests)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Bed Configuration</label>
                  <input
                    type="text"
                    value={newRoom.bed_type}
                    onChange={(e) => setNewRoom({ ...newRoom, bed_type: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm"
              >
                Save Room Configuration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
