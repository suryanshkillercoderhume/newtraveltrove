import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Community API
export const communityAPI = {
  getCommunities: (params) => api.get('/communities', { params }),
  getCommunity: (id) => api.get(`/communities/${id}`),
  createCommunity: (communityData) => api.post('/communities', communityData),
  updateCommunity: (id, communityData) => api.put(`/communities/${id}`, communityData),
  deleteCommunity: (id) => api.delete(`/communities/${id}`),
  joinCommunity: (id) => api.post(`/communities/${id}/join`),
  leaveCommunity: (id) => api.post(`/communities/${id}/leave`),
};

// Invitation API
export const invitationAPI = {
  sendInvitation: (invitationData) => api.post('/invitations', invitationData),
  getInvitation: (token) => api.get(`/invitations/${token}`),
  acceptInvitation: (token) => api.post(`/invitations/${token}/accept`),
  declineInvitation: (token) => api.post(`/invitations/${token}/decline`),
  getCommunityInvitations: (communityId) => api.get(`/invitations/community/${communityId}`),
};

// Message API
export const messageAPI = {
  getMessages: (communityId, params) => api.get(`/messages/${communityId}`, { params }),
  sendMessage: (communityId, messageData) => api.post(`/messages/${communityId}`, messageData),
  editMessage: (messageId, content) => api.put(`/messages/${messageId}`, { content }),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  addReaction: (messageId, emoji) => api.post(`/messages/${messageId}/reactions`, { emoji }),
  addReply: (messageId, content) => api.post(`/messages/${messageId}/replies`, { content }),
};

// Destination API
export const destinationAPI = {
  searchDestinations: (params) => api.get('/destinations/search', { params }),
  getDestinations: (params) => api.get('/destinations', { params }),
  getDestination: (id) => api.get(`/destinations/${id}`),
  createDestination: (destinationData) => api.post('/destinations', destinationData),
  updateDestination: (id, destinationData) => api.put(`/destinations/${id}`, destinationData),
  deleteDestination: (id) => api.delete(`/destinations/${id}`),
  getCategories: () => api.get('/destinations/categories'),
  getCountries: () => api.get('/destinations/countries'),
};

// Itinerary API
export const itineraryAPI = {
  getItineraries: (params) => api.get('/itineraries', { params }),
  getMyItineraries: (params) => api.get('/itineraries/my', { params }),
  getItinerary: (id) => api.get(`/itineraries/${id}`),
  createItinerary: (itineraryData) => api.post('/itineraries', itineraryData),
  updateItinerary: (id, itineraryData) => api.put(`/itineraries/${id}`, itineraryData),
  deleteItinerary: (id) => api.delete(`/itineraries/${id}`),
  duplicateItinerary: (id) => api.post(`/itineraries/${id}/duplicate`),
};

// Review API
export const reviewAPI = {
  getReviews: (params) => api.get('/reviews', { params }),
  getReview: (id) => api.get(`/reviews/${id}`),
  createReview: (reviewData) => api.post('/reviews', reviewData),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  getReviewStats: (type, id) => api.get(`/reviews/stats/${type}/${id}`),
};

// Favorite API
export const favoriteAPI = {
  getFavorites: (params) => api.get('/favorites', { params }),
  addFavorite: (favoriteData) => api.post('/favorites', favoriteData),
  removeFavorite: (id) => api.delete(`/favorites/${id}`),
  updateFavorite: (id, favoriteData) => api.put(`/favorites/${id}`, favoriteData),
  checkFavorite: (params) => api.get('/favorites/check', { params }),
  toggleFavorite: (favoriteData) => api.post('/favorites/toggle', favoriteData),
};

export default api;
