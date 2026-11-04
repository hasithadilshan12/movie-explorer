import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Search, Star, X } from 'lucide-react';
import { tmdb } from '../services/tmdb';
import { GENRES } from '../utils/constants';
import { formatYear } from '../utils/format';
import { handleImageError, posterUrl } from '../utils/images';
import { Spinner } from './Loader';

const RECENT_KEY = 'movie-explorer-recent-searches';

function loadRecent() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string').slice(0, 6) : [];
  } catch {
    return [];
  }
}

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(loadRecent);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    setQuery('');
    setResults([]);
    setLoading(false);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80);
    document.body.classList.add('no-scroll');

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      tmdb
        .search(trimmed, 1)
        .then((data) => {
          if (cancelled) return;
          setResults((data.results || []).filter((movie) => movie.poster_path).slice(0, 7));
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 320);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  if (!open) return null;

  const saveRecent = (value) => {
    const next = [value, ...recent.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(
      0,
      6
    );
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const goToResults = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    saveRecent(trimmed);
    onClose();
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const openMovie = (movie) => {
    if (query.trim()) saveRecent(query.trim());
    onClose();
    navigate(`/movie/${movie.id}`);
  };

  const clearRecent = (event, value) => {
    event.stopPropagation();
    const next = recent.filter((item) => item !== value);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  return createPortal(
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search movies"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="search-panel">
        <form
          className="search-field"
          onSubmit={(event) => {
            event.preventDefault();
            goToResults(query);
          }}
        >
          <Search size={21} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search movies, titles, stories…"
            aria-label="Search movies"
          />
          {loading && <Spinner size={18} />}
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search" title="Close search">
            <X size={20} />
          </button>
        </form>

        <div className="search-body">
          {query.trim() ? (
            loading && results.length === 0 ? (
              <div className="search-status">
                <Spinner size={22} />
                <span>Searching the movie universe…</span>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="search-list">
                  {results.map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      className="search-result"
                      onClick={() => openMovie(movie)}
                    >
                      <img
                        src={posterUrl(movie.poster_path, 'w200')}
                        alt=""
                        loading="lazy"
                        onError={handleImageError}
                      />
                      <span className="search-result-copy">
                        <strong>{movie.title}</strong>
                        <span>
                          {formatYear(movie.release_date) || '—'}
                          {movie.vote_average > 0 && (
                            <>
                              <i className="dot" />
                              <Star size={11} fill="currentColor" /> {movie.vote_average.toFixed(1)}
                            </>
                          )}
                        </span>
                      </span>
                      <ArrowRight size={17} className="search-result-arrow" />
                    </button>
                  ))}
                </div>
                <button type="button" className="search-all" onClick={() => goToResults(query)}>
                  See all results for “{query.trim()}” <ArrowRight size={15} />
                </button>
              </>
            ) : (
              <div className="search-status">
                <Search size={26} />
                <strong>No matches for “{query.trim()}”</strong>
                <span>Try a different title, or browse by genre below.</span>
              </div>
            )
          ) : (
            <>
              {recent.length > 0 && (
                <div className="search-section">
                  <p className="search-label">
                    <Clock size={13} /> Recent searches
                  </p>
                  <div className="recent-chips">
                    {recent.map((item) => (
                      <button key={item} type="button" className="chip" onClick={() => goToResults(item)}>
                        {item}
                        <span
                          role="button"
                          tabIndex={0}
                          className="chip-remove"
                          onClick={(event) => clearRecent(event, item)}
                          onKeyDown={(event) => event.key === 'Enter' && clearRecent(event, item)}
                          aria-label={`Remove ${item} from recent searches`}
                          title={`Remove ${item} from recent searches`}
                        >
                          <X size={12} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="search-section">
                <p className="search-label">Browse by genre</p>
                <div className="genre-chips">
                  {GENRES.slice(0, 10).map((genre) => (
                    <button
                      key={genre.id}
                      type="button"
                      className="chip chip-outline"
                      onClick={() => {
                        onClose();
                        navigate(`/search?genre=${genre.id}`);
                      }}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="search-hint">
                <kbd>Enter</kbd> to search all results <span>·</span> <kbd>Esc</kbd> to close
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
