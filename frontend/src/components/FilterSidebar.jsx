import React from 'react';

export const FilterSidebar = ({ filters, setFilters, onReset }) => {
  const locations = ['Goa', 'Mumbai', 'Jaipur', 'Manali', 'Bangalore', 'Udaipur', 'Kerala', 'New Delhi'];
  const popularFacilities = ['Free Wi-Fi', 'Swimming Pool', 'Spa', 'Restaurant', 'Air Conditioning', 'Free Parking'];
  const roomTypes = ['Deluxe', 'Suite', 'Villa', 'Classic'];

  const handleFacilityToggle = (fac) => {
    if (filters.facility === fac) {
      setFilters({ ...filters, facility: '' });
    } else {
      setFilters({ ...filters, facility: fac });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-base">Filter Hotels</h3>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
        >
          Reset All
        </button>
      </div>

      {/* Destination Location */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Destination
        </label>
        <select
          value={filters.location || ''}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Destinations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Max Price / Night
          </label>
          <span className="text-xs font-bold text-blue-600">
            ₹{Number(filters.max_price || 30000).toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min="3000"
          max="30000"
          step="1000"
          value={filters.max_price || 30000}
          onChange={(e) => setFilters({ ...filters, max_price: Number(e.target.value) })}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>₹3,000</span>
          <span>₹15,000</span>
          <span>₹30,000</span>
        </div>
      </div>

      {/* Star Rating */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Minimum Rating
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '4.8+ ★', value: 4.8 },
            { label: '4.5+ ★', value: 4.5 },
            { label: 'All', value: '' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setFilters({ ...filters, rating: item.value })}
              className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                filters.rating === item.value
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Room Category */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Room Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {roomTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilters({ ...filters, room_type: filters.room_type === type ? '' : type })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                filters.room_type === type
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Popular Amenities
        </label>
        <div className="space-y-2">
          {popularFacilities.map((facility) => (
            <label key={facility} className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={filters.facility === facility}
                onChange={() => handleFacilityToggle(facility)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>{facility}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
