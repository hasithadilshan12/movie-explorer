import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Compass, RefreshCw, Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { GridSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { tmdb } from '../services/tmdb';
import {
  GENRES,
  GENRE_MAP,
  RATING_OPTIONS,
  SORT_OPTIONS,
  YEAR_OPTIONS,
} from '../utils/constants';
import { formatCount } from '../utils/format';

const DEFAULT_SORT = 'popularity.desc';

function requestMovies(values, page) {
  if (values.q.trim()) {
    return tmdb.search(values.q.trim(), page, values.year ? { year: values.year } : {});
  }

  const params = {
    page,
    sort_by: values.sort || DEFAULT_SORT,
    'vote_count.gte': 30,
  };

  if (values.genre) params.with_genres = values.genre;
  if (values.year) params.primary_release_year = values.year;
  if (values.rating) params['vote_average.gte'] = values.rating;

  return tmdb.discover(params);
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const q = (searchParams.get('q') || '').trim();
  const genre = searchParams.get('genre') || '';
  const year = searchParams.get('year') || '';
  const rating = searchParams.get('rating') || '';
  const sort = searchParams.get('sort') || DEFAULT_SORT;

  const [input, setInput] = useState(q);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  const requestId = useRef(0);

  useEffect(() => {
    setInput(q);
  }, [q]);

  useEffect(() => {
    const id = ++requestId.current;
    let cancelled = false;

    setLoading(true);
    setError('');

    const run = async () => {
      try {
        const data = await requestMovies({ q, genre, year, rating, sort }, 1);
        if (cancelled || id !== requestId.current) return;
        setMovies(data.results || []);
        setPage(1);
        setTotalPages(Math.min(data.total_pages || 1, 500));
        setTotalResults(data.total_results || 0);
      } catch (err) {
        if (cancelled || id !== requestId.current) return;
        setMovies([]);
        setError(err.message || 'Could not load movies.');
      } finally {
        if (!cancelled && id === requestId.current) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [q, genre, year, rating, sort, refresh]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      setSearchParams(next, { replace: true });
      return;
    }

    if (trimmed === q) {
      setRefresh((value) => value + 1);
      return;
    }

    // Text search supports a year filter; other filters belong to discovery.
    const next = new URLSearchParams();
    next.set('q', trimmed);
    if (year) next.set('year', year);
    setSearchParams(next, { replace: true });
  };

  const selectGenre = (genreId) => {
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    if (genreId) next.set('genre', String(genreId));
    else next.delete('genre');
    setSearchParams(next, { replace: true });
  };

  const clearAll = () => {
    setInput('');
    setSearchParams({}, { replace: true });
  };

  const loadMore = async () => {
    if (loading || loadingMore || page >= totalPages) return;

    const id = requestId.current;
    setLoadingMore(true);

    try {
      const data = await requestMovies({ q, genre, year, rating, sort }, page + 1);
      if (id !== requestId.current) return;
      setMovies((current) => {
        const seen = new Set(current.map((movie) => movie.id));
        return [...current, ...(data.results || []).filter((movie) => !seen.has(movie.id))];
      });
      setPage((current) => current + 1);
      setTotalPages(Math.min(data.total_pages || 1, 500));
      setTotalResults(data.total_results || 0);
    } catch (err) {
      toast.error(err.message || 'Could not load more movies.');
    } finally {
      setLoadingMore(false);
    }
  };

  const activeGenre = GENRE_MAP[genre];
  const hasFilters = Boolean(q || genre || year || rating || sort !== DEFAULT_SORT);
  const heading = q ? `Results for “${q}”` : activeGenre ? `${activeGenre} movies` : 'Discover movies';

  useEffect(() => {
    document.title = q ? `${q} — MovieExplorer` : 'Discover movies — MovieExplorer';
  }, [q]);

  return (
    <div className="page search-page">
      <div className="container">
        <div className="page-heading">
          <p className="eyebrow">
            <Compass size={13} /> Explore the library
          </p>
          <h1>{heading}</h1>
          <p className="page-lead">
            {loading
              ? 'Finding the best matches…'
              : q
                ? `${formatCount(totalResults)} movie${totalResults === 1 ? '' : 's'} matched your search.`
                : `${formatCount(totalResults)} movies to explore. Filter by genre, year and rating.`}
          </p>
        </div>

        <form className="search-form-lg" onSubmit={handleSearch} role="search">
          <SearchIcon size={19} />
          <input
            type="search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search for a movie title…"
            aria-label="Search for a movie"
          />
          {input && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                setInput('');
                updateParam('q', '');
              }}
              aria-label="Clear search text"
            >
              <X size={17} />
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        <div className="genre-strip" aria-label="Browse by genre">
          <button
            type="button"
            className={`chip ${!genre ? 'is-active' : ''}`}
            onClick={() => selectGenre('')}
          >
            All
          </button>
          {GENRES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`chip ${String(item.id) === genre ? 'is-active' : ''}`}
              onClick={() => selectGenre(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="filter-bar">
          <span className="filter-title">
            <SlidersHorizontal size={15} /> Filters
          </span>

          {!q && (
            <label className="filter-group">
              <span>Genre</span>
              <select value={genre} onChange={(event) => updateParam('genre', event.target.value)}>
                <option value="">All genres</option>
                {GENRES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="filter-group">
            <span>Year</span>
            <select value={year} onChange={(event) => updateParam('year', event.target.value)}>
              <option value="">Any year</option>
              {YEAR_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {!q && (
            <label className="filter-group">
              <span>Rating</span>
              <select value={rating} onChange={(event) => updateParam('rating', event.target.value)}>
                {RATING_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {!q && (
            <label className="filter-group">
              <span>Sort by</span>
              <select value={sort} onChange={(event) => updateParam('sort', event.target.value)}>
                {SORT_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {q && (
            <span className="filter-note">Genre and rating filters apply when browsing.</span>
          )}

          {hasFilters && (
            <button type="button" className="btn btn-ghost btn-sm filter-reset" onClick={clearAll}>
              <X size={14} /> Reset
            </button>
          )}
        </div>

        {error && !loading && (
          <div className="alert-banner alert-error">
            <div>
              <strong>Could not load results</strong>
              <p>{error}</p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setRefresh((value) => value + 1)}
            >
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <GridSkeleton count={12} />
        ) : movies.length > 0 ? (
          <>
            <div className="results-bar">
              <span>
                Showing <strong>{movies.length}</strong> of{' '}
                <strong>{formatCount(totalResults)}</strong> results
              </span>
              <span>
                Page {page} of {totalPages}
              </span>
            </div>

            <div className="movie-grid">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {page < totalPages && (
              <div className="load-more-wrap">
                <button
                  type="button"
                  className="btn btn-outline btn-lg"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading more…' : 'Load more movies'}
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={SearchIcon}
            title="No movies found"
            message={
              q
                ? 'Try a shorter title, check the spelling, or clear the filters.'
                : 'Try changing the genre, year or rating filters.'
            }
            actionLabel="Reset filters"
            onAction={clearAll}
          />
        )}

        <div className="search-tip">
          Looking for something else? <Link to="/">Back to trending movies</Link>
        </div>
      </div>
    </div>
  );
}
