import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { HotelCard } from '../components/HotelCard';
import { FilterSidebar } from '../components/FilterSidebar';

export const HotelListingPage = () => {
  const routerLocation = useLocation();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse URL query params
  const queryParams = new URLSearchParams(routerLocation.search);
  const initialLocation = queryParams.get('location') || '';

  const [filters, setFilters] = useState({
    location: initialLocation,
    min_price: '',
    max_price: 30000,
    rating: '',
    facility: '',
    room_type: '',
    sort_by: 'rating_desc',
  });

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.hotels.getAll(filters);
      setHotels(res.hotels || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve available hotels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      location: '',
      min_price: '',
      max_price: 30000,
      rating: '',
      facility: '',
      room_type: '',
      sort_by: 'rating_desc',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {filters.location ? `Hotels in ${filters.location}` : 'All Available Hotels'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {hotels.length} luxury and comfortable properties
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sort by:
          </label>
          <select
            value={filters.sort_by}
            onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="rating_desc">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Sidebar + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Right Hotel Cards */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-red-100 shadow-sm space-y-3">
              <span className="text-3xl">⚠️</span>
              <h3 className="font-bold text-slate-800 text-base">Unable to Load Hotels</h3>
              <p className="text-xs text-slate-500">{error}</p>
              <button
                onClick={fetchHotels}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                Try Again
              </button>
            </div>
          ) : hotels.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <span className="text-4xl">🏨</span>
              <h3 className="font-bold text-slate-800 text-lg">No Hotels Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No hotels match your specific filter criteria. Try expanding your search or clearing the filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
