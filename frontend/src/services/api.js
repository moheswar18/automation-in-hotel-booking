// API Client Service for StayEase Hotel Booking Platform

const BASE_URL = window.location.port === '3000' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

export const getAuthToken = () => localStorage.getItem('stayease_token');
export const setAuthToken = (token) => localStorage.setItem('stayease_token', token);
export const removeAuthToken = () => localStorage.removeItem('stayease_token');

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('stayease_user'));
  } catch (e) {
    return null;
  }
};
export const setStoredUser = (user) => localStorage.setItem('stayease_user', JSON.stringify(user));
export const removeStoredUser = () => localStorage.removeItem('stayease_user');

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: Request failed`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    register: (userData) => request('/register', { method: 'POST', body: userData }),
    login: (credentials) => request('/login', { method: 'POST', body: credentials }),
    logout: () => request('/logout', { method: 'POST' }),
    getCurrentUser: () => request('/me', { method: 'GET' }),
  },

  // Hotels
  hotels: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.location) query.append('location', params.location);
      if (params.min_price) query.append('min_price', params.min_price);
      if (params.max_price) query.append('max_price', params.max_price);
      if (params.rating) query.append('rating', params.rating);
      if (params.facility) query.append('facility', params.facility);
      if (params.room_type) query.append('room_type', params.room_type);
      if (params.sort_by) query.append('sort_by', params.sort_by);
      return request(`/hotels?${query.toString()}`, { method: 'GET' });
    },
    getById: (id) => request(`/hotels/${id}`, { method: 'GET' }),
    create: (data) => request('/hotels', { method: 'POST', body: data }),
    update: (id, data) => request(`/hotels/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/hotels/${id}`, { method: 'DELETE' }),
  },

  // Rooms
  rooms: {
    getByHotelId: (hotelId) => request(`/hotels/${hotelId}/rooms`, { method: 'GET' }),
    create: (data) => request('/rooms', { method: 'POST', body: data }),
    update: (id, data) => request(`/rooms/${id}`, { method: 'PUT', body: data }),
    toggleAvailability: (id, availability) => request(`/rooms/${id}/availability`, { method: 'PATCH', body: { availability } }),
    delete: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),
  },

  // Bookings
  bookings: {
    create: (bookingData) => request('/bookings', { method: 'POST', body: bookingData }),
    getAll: (params = {}) => {
      const query = new URLSearchParams(params);
      return request(`/bookings?${query.toString()}`, { method: 'GET' });
    },
    getById: (id) => request(`/bookings/${id}`, { method: 'GET' }),
    updateStatus: (id, status) => request(`/bookings/${id}`, { method: 'PUT', body: { status } }),
    delete: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),
  },

  // Simulated Payment
  payments: {
    process: (data) => request('/payments', { method: 'POST', body: data }),
  },

  // Admin
  admin: {
    getDashboard: () => request('/admin/dashboard', { method: 'GET' }),
  },

  // Health
  health: {
    check: () => {
      const healthUrl = BASE_URL.replace('/api', '/health');
      return request(healthUrl, { method: 'GET' });
    }
  }
};
