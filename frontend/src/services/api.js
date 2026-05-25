import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach JWT to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────
export const register = (data) => API.post('/auth/register', data);
export const login    = (data) => API.post('/auth/login', data);

// ── Restaurants ───────────────────────────────────
export const getAllRestaurants  = ()                       => API.get('/restaurants');
export const getNearbyRestaurants = (lat, lng, radius, cuisine) =>
  API.get('/restaurants/nearby', { params: { lat, lng, radius, cuisine } });
export const getRestaurant      = (id)                    => API.get(`/restaurants/${id}`);
export const getMenu            = (id)                    => API.get(`/restaurants/${id}/menu`);
export const createRestaurant   = (data)                  => API.post('/restaurants', data);
export const updateRestaurant   = (id, data)              => API.put(`/restaurants/${id}`, data);
export const addMenuItem        = (restaurantId, item)    => API.post(`/restaurants/${restaurantId}/menu`, item);
export const updateMenuItem     = (rId, iId, data)        => API.put(`/restaurants/${rId}/menu/${iId}`, data);
export const deleteMenuItem     = (rId, iId)              => API.delete(`/restaurants/${rId}/menu/${iId}`);

// ── Orders ────────────────────────────────────────
export const createOrder       = (data)          => API.post('/orders', data);
export const getMyOrders       = ()              => API.get('/orders/my-orders');
export const getOrder          = (id)            => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, data)      => API.patch(`/orders/${id}/status`, data);
export const payOrder          = (id, data)      => API.post(`/orders/${id}/pay`, data);
export const getRestaurantOrders = (rId)         => API.get(`/orders/restaurant/${rId}`);
export const getActiveOrders   = (rId)           => API.get(`/orders/restaurant/${rId}/active`);

// ── Reviews ───────────────────────────────────────
export const submitReview         = (data) => API.post('/reviews', data);
export const getRestaurantReviews = (rId)  => API.get(`/reviews/restaurant/${rId}`);
export const getMyReviews         = ()     => API.get('/reviews/my-reviews');

// ── Reservations ─────────────────────────────────
export const createReservation       = (data)          => API.post('/reservations', data);
export const updateReservationStatus = (id, status)    => API.patch(`/reservations/${id}/status?status=${status}`);
export const getMyReservations       = ()              => API.get('/reservations/my-reservations');
export const getRestaurantReservations = (rId)         => API.get(`/reservations/restaurant/${rId}`);
