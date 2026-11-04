import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Play, Star, X } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { formatYear } from '../utils/format';
import { GENRE_MAP } from '../utils/constants';
import { handleImageError, posterUrl } from '../utils/images';

export default function MovieCard({ movie, onRemove, removeLabel = 'Remove' }) {
  const { toggleWatchlist, isInWatchlist } = useLibrary();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const title = movie.title || movie.name || 'Untitled';
  const saved = isInWatchlist(movie.id);
  const rating = Number(movie.vote_average) || 0;
  const genre = movie.genre_ids?.length ? GENRE_MAP[movie.genre_ids[0]] : '';

  const handleSave = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const result = await toggleWatchlist(movie.id);
    if (result.reason === 'auth') {
      navigate('/login', { state: { from: location.pathname } });
    }
  };

  const handleRemove = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!onRemove) return;
    await onRemove(movie.id);
  };

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="movie-card"
      aria-label={`${title}${rating ? `, rated ${rating.toFixed(1)} out of 10` : ''}`}
    >
      <div className="poster-wrap">
        <img
          src={posterUrl(movie.poster_path)}
          alt={`${title} poster`}
          className="poster"
          loading="lazy"
          onError={handleImageError}
        />

        <div className="card-badges">
          {rating > 0 && (
            <span className="rating-chip">
              <Star size={11} fill="currentColor" />
              {rating.toFixed(1)}
            </span>
          )}
          {movie.adult && <span className="quality-chip">18+</span>}
        </div>

        {onRemove ? (
          <button
            type="button"
            className="card-remove"
            onClick={handleRemove}
            aria-label={`${removeLabel} ${title}`}
            title={removeLabel}
          >
            <X size={16} />
          </button>
        ) : (
          <button
            type="button"
            className={`card-save ${saved ? 'is-saved' : ''}`}
            onClick={handleSave}
            aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
            title={saved ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        )}

        <div className="card-hover">
          <span className="card-play">
            <Play size={18} fill="currentColor" />
          </span>
          <span>View details</span>
        </div>
      </div>

      <div className="card-body">
        <h3 title={title}>{title}</h3>
        <div className="card-meta">
          <span>{formatYear(movie.release_date) || '—'}</span>
          {genre && (
            <>
              <span className="dot" />
              <span className="card-genre">{genre}</span>
            </>
          )}
          {!isAuthenticated && rating > 7.8 && (
            <span className="card-hot" title="Highly rated">
              HOT
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
