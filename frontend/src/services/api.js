import { API_URL } from '../utils/constants';

export class ApiError extends Error {
  constructor(message, status = 0, code = '') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Small fetch wrapper around the Movie Explorer API.
 * Automatically attaches the JWT and normalises error messages.
 */
export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const authToken = token === undefined ? localStorage.getItem('token') : token;
  const headers = {};

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'Could not reach the server. Make sure the backend is running on port 5000.',
      0,
      'NETWORK'
    );
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    if (response.status === 401 && authToken) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new ApiError(
      data?.error || `Request failed (${response.status})`,
      response.status,
      data?.code || ''
    );
  }

  return data;
}

export const authApi = {
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload, token: null }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload, token: null }),
  google: (credential) =>
    apiRequest('/auth/google', { method: 'POST', body: { credential }, token: null }),
  me: (token) => apiRequest('/auth/me', { token }),
  updateProfile: (payload) => apiRequest('/auth/me', { method: 'PATCH', body: payload }),
};

export const libraryApi = {
  get: () => apiRequest('/watchlist'),
  addToWatchlist: (movieId) => apiRequest('/watchlist/add', { method: 'POST', body: { movieId } }),
  removeFromWatchlist: (movieId) => apiRequest(`/watchlist/${movieId}`, { method: 'DELETE' }),
  addToFavorites: (movieId) =>
    apiRequest('/watchlist/favorites/add', { method: 'POST', body: { movieId } }),
  removeFromFavorites: (movieId) =>
    apiRequest(`/watchlist/favorites/${movieId}`, { method: 'DELETE' }),
};

export const reviewApi = {
  forMovie: (movieId) => apiRequest(`/reviews/${movieId}`),
  mine: () => apiRequest('/reviews/mine'),
  save: (movieId, payload) => apiRequest(`/reviews/${movieId}`, { method: 'POST', body: payload }),
  remove: (movieId) => apiRequest(`/reviews/${movieId}`, { method: 'DELETE' }),
};
