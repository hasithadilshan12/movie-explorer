/* ------------------------------------------------------------------ */
/*  App-wide constants                                                */
/* ------------------------------------------------------------------ */

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

// The key below is the one already used by the original app. You can move it
// to a .env file (VITE_TMDB_API_KEY) without touching any code.
export const TMDB_API_KEY =
  import.meta.env.VITE_TMDB_API_KEY || '528331268dcbaa76f2073c924ba335dc';

export const TMDB_BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export const GENRE_MAP = Object.fromEntries(GENRES.map((genre) => [genre.id, genre.name]));

export const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most popular' },
  { value: 'vote_average.desc', label: 'Highest rated' },
  { value: 'primary_release_date.desc', label: 'Newest first' },
  { value: 'primary_release_date.asc', label: 'Oldest first' },
  { value: 'revenue.desc', label: 'Biggest box office' },
];

export const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '9', label: '9+ exceptional' },
  { value: '8', label: '8+ great' },
  { value: '7', label: '7+ good' },
  { value: '6', label: '6+ okay' },
];

export const CURRENT_YEAR = new Date().getFullYear();

export const YEAR_OPTIONS = Array.from({ length: 56 }, (_, index) => CURRENT_YEAR + 2 - index);

export const LANGUAGES = {
  en: 'English',
  si: 'Sinhala',
  ta: 'Tamil',
  hi: 'Hindi',
  ja: 'Japanese',
  ko: 'Korean',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
  zh: 'Chinese',
  ru: 'Russian',
};
