import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bookmark, Clock3, Film, Heart, Sparkles, Star } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import EmptyState from '../components/EmptyState';
import { GridSkeleton } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { tmdb } from '../services/tmdb';

export default function Watchlist() {
  const { user } = useAuth();
  const {
    watchlist,
    favorites,
    removeFromWatchlist,
    removeFromFavorites,
  } = useLibrary();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'favorites' ? 'favorites' : 'watchlist';

  const ids = tab === 'favorites' ? favorites : watchlist;
  const idsKey = ids.join(',');

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!ids.length) {
      setMovies([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    Promise.allSettled(ids.map((id) => tmdb.getMovie(id)))
      .then((results) => {
        if (cancelled) return;
        setMovies(
          results
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value)
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  useEffect(() => {
    document.title = 'My library — MovieExplorer';
  }, [tab]);

  const stats = useMemo(() => {
    const totalRuntime = movies.reduce((sum, movie) => sum + (movie.runtime || 0), 0);
    const rated = movies.filter((movie) => movie.vote_average > 0);
    const average = rated.length
      ? rated.reduce((sum, movie) => sum + movie.vote_average, 0) / rated.length
      : 0;

    return {
      count: ids.length,
      hours: Math.round((totalRuntime / 60) * 10) / 10,
      average,
    };
  }, [movies, ids.length]);

  const switchTab = (nextTab) => {
    if (nextTab === 'favorites') setSearchParams({ tab: 'favorites' }, { replace: true });
    else setSearchParams({}, { replace: true });
  };

  const greeting = user?.username ? `${user.username}'s` : 'Your';

  return (
    <div className="page library-page">
      <div className="container">
        <div className="library-head">
          <div>
            <p className="eyebrow">
              <Sparkles size={13} /> Personal collection
            </p>
            <h1>{greeting} library</h1>
            <p className="page-lead">
              Everything you have saved, ready for your next movie night.
            </p>
          </div>
          <Link to="/search" className="btn btn-primary">
            <Film size={17} /> Find something to watch
          </Link>
        </div>

        <div className="library-stats">
          <div className="library-stat">
            <span className="library-stat-icon">
              <Bookmark size={18} />
            </span>
            <div>
              <strong>{watchlist.length}</strong>
              <span>In watchlist</span>
            </div>
          </div>
          <div className="library-stat">
            <span className="library-stat-icon">
              <Heart size={18} />
            </span>
            <div>
              <strong>{favorites.length}</strong>
              <span>Favorites</span>
            </div>
          </div>
          <div className="library-stat">
            <span className="library-stat-icon">
              <Clock3 size={18} />
            </span>
            <div>
              <strong>{stats.hours || 0}h</strong>
              <span>Total runtime</span>
            </div>
          </div>
          <div className="library-stat">
            <span className="library-stat-icon">
              <Star size={18} />
            </span>
            <div>
              <strong>{stats.average ? stats.average.toFixed(1) : '—'}</strong>
              <span>Average score</span>
            </div>
          </div>
        </div>

        <div className="library-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'watchlist'}
            className={tab === 'watchlist' ? 'is-active' : ''}
            onClick={() => switchTab('watchlist')}
          >
            <Bookmark size={16} /> Watchlist
            <span>{watchlist.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'favorites'}
            className={tab === 'favorites' ? 'is-active' : ''}
            onClick={() => switchTab('favorites')}
          >
            <Heart size={16} /> Favorites
            <span>{favorites.length}</span>
          </button>
        </div>

        {loading ? (
          <GridSkeleton count={8} />
        ) : movies.length > 0 ? (
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                removeLabel={tab === 'favorites' ? 'Remove from favorites' : 'Remove from watchlist'}
                onRemove={tab === 'favorites' ? removeFromFavorites : removeFromWatchlist}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={tab === 'favorites' ? Heart : Bookmark}
            title={tab === 'favorites' ? 'No favorites yet' : 'Your watchlist is empty'}
            message={
              tab === 'favorites'
                ? 'Tap the heart on any movie page to keep the films you love close.'
                : 'Explore trending movies and save anything that catches your eye.'
            }
            actionLabel="Discover movies"
            actionTo="/search"
          />
        )}

        <div className="library-tip">
          <p>
            Tip: press <kbd>/</kbd> anywhere to search, or open a movie and tap the bookmark icon to
            save it instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
