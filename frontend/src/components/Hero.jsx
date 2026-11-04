import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Info, Play, Star } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { tmdbRequest } from '../services/tmdb';
import { findTrailer } from '../utils/video';
import { formatYear } from '../utils/format';
import { backdropUrl } from '../utils/images';
import TrailerModal from './TrailerModal';

export default function Hero({ movies = [], loading = false }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { toggleWatchlist, isInWatchlist } = useLibrary();
  const navigate = useNavigate();
  const location = useLocation();

  const slides = movies.filter((movie) => movie.backdrop_path).slice(0, 5);
  const movie = slides[active];

  useEffect(() => {
    setActive(0);
  }, [movies]);

  useEffect(() => {
    if (slides.length < 2 || paused) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length, paused]);

  useEffect(() => {
    setTrailerKey(null);
    if (!movie?.id) return undefined;

    let cancelled = false;
    tmdbRequest(`/movie/${movie.id}`, { append_to_response: 'videos' })
      .then((details) => {
        if (!cancelled) setTrailerKey(findTrailer(details.videos?.results)?.key || null);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [movie?.id]);

  const handleSave = async () => {
    if (!movie) return;
    const result = await toggleWatchlist(movie.id);
    if (result.reason === 'auth') {
      navigate('/login', { state: { from: location.pathname } });
    }
  };

  const saved = movie ? isInWatchlist(movie.id) : false;

  if (loading || slides.length === 0) {
    return (
      <section className="hero hero-loading">
        <div className="hero-content container">
          <div className="skeleton skeleton-line" style={{ width: 150, height: 16 }} />
          <div className="skeleton skeleton-line hero-title-skeleton" />
          <div className="skeleton skeleton-line" style={{ width: '58%', height: 18 }} />
          <div className="skeleton skeleton-line" style={{ width: '72%', height: 14, marginTop: 16 }} />
          <div className="hero-actions" style={{ marginTop: 30 }}>
            <div className="skeleton skeleton-button" />
            <div className="skeleton skeleton-button" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-media" aria-hidden="true">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`hero-slide ${index === active ? 'is-active' : ''}`}>
            <img src={backdropUrl(slide.backdrop_path)} alt="" />
          </div>
        ))}
        <div className="hero-shade" />
      </div>

      <div className="hero-content container" key={movie.id}>
        <div className="hero-eyebrow">
          <span className="live-dot" />
          #{active + 1} trending this week
        </div>

        <h1 className="hero-title">{movie.title}</h1>

        <div className="hero-meta">
          <span className="score">
            <Star size={14} fill="currentColor" />
            {Number(movie.vote_average || 0).toFixed(1)}
          </span>
          <span>{formatYear(movie.release_date)}</span>
          <span className="meta-dot" />
          <span>{movie.adult ? '18+' : 'PG-13'}</span>
          <span className="meta-dot" />
          <span>{movie.original_language?.toUpperCase()}</span>
          <span className="hero-quality">HD</span>
        </div>

        <p className="hero-overview">
          {movie.overview || 'An unforgettable story is waiting for you. Open the details page to learn more.'}
        </p>

        <div className="hero-actions">
          <Link to={`/movie/${movie.id}`} className="btn btn-primary btn-lg">
            <Info size={18} />
            View details
          </Link>

          <button
            type="button"
            className="btn btn-glass btn-lg"
            onClick={() => {
              if (trailerKey) setTrailerOpen(true);
            }}
            disabled={!trailerKey}
          >
            <Play size={18} fill="currentColor" />
            {trailerKey ? 'Watch trailer' : 'Trailer soon'}
          </button>

          <button
            type="button"
            className={`btn btn-icon btn-lg ${saved ? 'is-saved' : ''}`}
            onClick={handleSave}
            aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
            title={saved ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
        </div>
      </div>

      <div className="hero-pagination container">
        <div className="hero-dots">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={index === active ? 'is-active' : ''}
              onClick={() => setActive(index)}
              aria-label={`Show ${slide.title}`}
            />
          ))}
        </div>
        <span className="hero-count">
          <strong>{String(active + 1).padStart(2, '0')}</strong> / {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        videoKey={trailerKey}
        title={movie.title}
      />
    </section>
  );
}
