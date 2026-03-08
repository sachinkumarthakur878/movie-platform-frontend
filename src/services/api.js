import axios from 'axios';

// const BASE_URL = 'http://localhost:5001/api';
const BASE_URL = 'https://movie-platform-backend-f8rg.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token attach karo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===================== AUTH APIs =====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ===================== MOVIE APIs =====================
export const movieAPI = {
  getTrending: () => api.get('/movies/trending'),
  search: (query) => api.get(`/movies/search?q=${query}`),
  getDetails: (id) => api.get(`/movies/${id}`),
  getTrailer: (id) => api.get(`/movies/${id}/trailer`),
  getCast: (id) => api.get(`/movies/${id}/cast`),
};

// ===================== FAVORITE APIs =====================
export const favoriteAPI = {
  add: (data) => api.post('/favorites', data),
  getAll: () => api.get('/favorites'),
  remove: (movieId) => api.delete(`/favorites/${movieId}`),
};

// ===================== HISTORY APIs =====================
export const historyAPI = {
  add: (data) => api.post('/history', data),
  getAll: () => api.get('/history'),
  remove: (movieId) => api.delete(`/history/${movieId}`),
};

// ===================== REVIEW APIs =====================
export const reviewAPI = {
  add: (data) => api.post('/reviews', data),
  getByMovie: (movieId) => api.get(`/reviews/${movieId}`),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// ===================== ADMIN APIs =====================
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/user/${id}`),
};

export default api;
