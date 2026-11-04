import { TMDB_API_KEY, TMDB_BASE } from '../utils/constants';

const cache = new Map();
const inFlight = new Map();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

function cacheKey(path, params) {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  ).toString();
  return `${path}?${search}`;
}

/**
 * Fetch from TMDB with a small in-memory cache and request de-duplication.
 */
export function tmdbRequest(path, params = {}) {
  const key = cacheKey(path, params);
  const cached = cache.get(key);

  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return Promise.resolve(cached.data);
  }

  if (inFlight.has(key)) return inFlight.get(key);

  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');
  if (!url.searchParams.has('include_adult')) url.searchParams.set('include_adult', 'false');

  Object.entries(params).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(name, value);
    }
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  const request = fetch(url.toString(), { signal: controller.signal })
    .then(async (response) => {
      clearTimeout(timeout);
      if (!response.ok) {
        let message = 'Could not load data from TMDB.';
        try {
          const payload = await response.json();
          if (payload?.status_message) message = payload.status_message;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }
      const data = await response.json();
      cache.set(key, { data, time: Date.now() });
      return data;
    })
    .catch((error) => {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        throw new Error('The request took too long. Please try again.', { cause: error });
      }
      throw error;
    })
    .finally(() => inFlight.delete(key));

  inFlight.set(key, request);
  return request;
}

/* ------------------------------------------------------------------ */
/*  Discovery                                                         */
/* ------------------------------------------------------------------ */
export const tmdb = {
  trending: (window = 'week') => tmdbRequest(`/trending/movie/${window}`),
  popular: (page = 1) => tmdbRequest('/movie/popular', { page }),
  topRated: (page = 1) => tmdbRequest('/movie/top_rated', { page }),
  nowPlaying: (page = 1) => tmdbRequest('/movie/now_playing', { page }),
  upcoming: (page = 1) => tmdbRequest('/movie/upcoming', { page }),
  getMovie: (movieId) =>
    tmdbRequest(`/movie/${movieId}`, {
      append_to_response:
        'credits,videos,similar,recommendations,external_ids,release_dates,watch/providers',
    }),
  getPerson: (personId) =>
    tmdbRequest(`/person/${personId}`, { append_to_response: 'combined_credits,external_ids' }),
  search: (query, page = 1, params = {}) => tmdbRequest('/search/movie', { query, page, ...params }),
  discover: (params = {}) => tmdbRequest('/discover/movie', params),
};
