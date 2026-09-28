import React from 'react';
import { Link } from 'react-router-dom';

export const HotelCard = ({ hotel }) => {
  const facilitiesList = Array.isArray(hotel.facilities)
    ? hotel.facilities
    : (hotel.facilities || '').split(',').map((f) => f.trim()).filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col group">
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

        {/* Location Tag */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center shadow-sm">
          <svg className="w-3.5 h-3.5 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {hotel.location}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-amber-400 text-slate-900 px-2.5 py-1 rounded-full text-xs font-black flex items-center shadow-md">
          <svg className="w-3.5 h-3.5 mr-1 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {Number(hotel.rating).toFixed(1)}
        </div>

        {/* Starting Price pill in bottom image */}
        <div className="absolute bottom-3 right-3 text-right">
          <span className="text-[11px] text-slate-200 block">Starting from</span>
          <span className="text-lg font-black text-white">₹{Number(hotel.starting_price || 4200).toLocaleString('en-IN')}</span>
          <span className="text-xs text-slate-300 font-normal"> /night</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition mb-1">
          {hotel.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-4">
          {hotel.description}
        </p>

        {/* Facilities Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
          {facilitiesList.slice(0, 4).map((facility, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium"
            >
              {facility}
            </span>
          ))}
          {facilitiesList.length > 4 && (
            <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[11px]">
              +{facilitiesList.length - 4} more
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
          <Link
            to={`/hotels/${hotel.id}`}
            className="w-full text-center py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
          >
            View Details
          </Link>
          <Link
            to={`/hotels/${hotel.id}#rooms`}
            className="w-full text-center py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};
