import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { HotelCard } from '../components/HotelCard';

export const HomePage = () => {
  const navigate = useNavigate();
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchParams, setSearchParams] = useState({
    location: '',
    check_in: '',
    check_out: '',
    guests: '2',
  });

  useEffect(() => {
    // Default dates: tomorrow and 3 days later
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkout = new Date(tomorrow);
    checkout.setDate(checkout.getDate() + 3);

    setSearchParams((prev) => ({
      ...prev,
      check_in: tomorrow.toISOString().split('T')[0],
      check_out: checkout.toISOString().split('T')[0],
    }));

    // Fetch featured hotels
    api.hotels.getAll({ sort_by: 'rating_desc' })
      .then((res) => {
        if (res.hotels) {
          setFeaturedHotels(res.hotels.slice(0, 4));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams(searchParams).toString();
    navigate(`/hotels?${query}`);
  };

  const destinations = [
    { name: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80', tag: 'Beaches & Nightlife' },
    { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80', tag: 'Skyline & Heritage' },
    { name: 'Jaipur', image: 'https://images.unsplash.com/photo-1603262110263-fb010d6e59d4?auto=format&fit=crop&w=600&q=80', tag: 'Royal Palaces' },
    { name: 'Manali', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80', tag: 'Himalayan Snow Peaks' },
    { name: 'Udaipur', image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80', tag: 'Lakes & Romance' },
    { name: 'Kerala', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80', tag: 'Tranquil Backwaters' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white pt-24 pb-36 px-4 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury Hotel"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/70 to-slate-900"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            Automated Cloud Infrastructure & Resilient Booking
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Perfect Stay</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Search, compare and book comfortable hotels with ease. Deployed with high availability, load balancing, and real-time monitoring.
          </p>

          {/* Hotel Search Box */}
          <div className="max-w-4xl mx-auto mt-10 bg-white rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-900 border border-slate-100">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-center">
              {/* Location Input */}
              <div className="text-left px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Destination
                </label>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={searchParams.location}
                    onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Check-In */}
              <div className="text-left px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={searchParams.check_in}
                  onChange={(e) => setSearchParams({ ...searchParams, check_in: e.target.value })}
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
                  required
                />
              </div>

              {/* Check-Out */}
              <div className="text-left px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={searchParams.check_out}
                  onChange={(e) => setSearchParams({ ...searchParams, check_out: e.target.value })}
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
                  required
                />
              </div>

              {/* Guests + Submit Button */}
              <div className="flex gap-2">
                <div className="text-left px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200 w-2/5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Guests
                  </label>
                  <select
                    value={searchParams.guests}
                    onChange={(e) => setSearchParams({ ...searchParams, guests: e.target.value })}
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4+ Guests</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-3/5 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Top Locations</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Popular Destinations</h2>
          </div>
          <button
            onClick={() => navigate('/hotels')}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
          >
            Explore all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {destinations.map((dest) => (
            <div
              key={dest.name}
              onClick={() => navigate(`/hotels?location=${dest.name}`)}
              className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition duration-300"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-bold text-base group-hover:text-blue-300 transition">{dest.name}</h3>
                <p className="text-[11px] text-slate-300 truncate">{dest.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Curated Stays</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Featured Hotels</h2>
          </div>
          <button
            onClick={() => navigate('/hotels')}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
          >
            View all properties
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-3 mb-10">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">The StayEase Advantage</span>
            <h2 className="text-2xl sm:text-3xl font-black">Why Choose Our Booking Platform</h2>
            <p className="text-sm text-slate-300">
              Combining world-class hospitality selections with industrial-strength cloud resilience, high throughput, and seamless booking confirmations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-lg">
                ⚡
              </div>
              <h3 className="font-bold text-base text-white">Easy Booking</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Intuitive search, real-time availability filters, and instant reservation confirmations in seconds.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-lg">
                🔒
              </div>
              <h3 className="font-bold text-base text-white">Secure Booking</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Simulated zero-risk academic payments with cryptographic tokenization and stateful transaction records.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-lg">
                👑
              </div>
              <h3 className="font-bold text-base text-white">Best Available Rooms</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Handpicked resorts, suites, and chalets across 8+ premier destinations with verified pricing.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/30 text-cyan-300 flex items-center justify-center font-bold text-lg">
                ☁️
              </div>
              <h3 className="font-bold text-base text-white">Reliable Service</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Zero-downtime infrastructure automated with Terraform, Ansible, AWS ALB, and Prometheus monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
