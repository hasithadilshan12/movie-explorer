import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Clock,
  ExternalLink,
  Heart,
  MessageSquare,
  Play,
  RefreshCw,
  Share2,
  Star,
  Trash2,
} from 'lucide-react';
import MovieRow from '../components/MovieRow';
import TrailerModal from '../components/TrailerModal';
import RatingStars from '../components/RatingStars';
import EmptyState from '../components/EmptyState';
import { DetailsSkeleton, Spinner } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { reviewApi } from '../services/api';
import { tmdb } from '../services/tmdb';
import { findTrailer } from '../utils/video';
import {
  formatCount,
  formatDate,
  formatLanguage,
  formatMoney,
  formatRelative,
  formatRuntime,
  formatYear,
  initials,
} from '../utils/format';
import {
  backdropUrl,
  handleImageError,
  posterUrl,
  profileUrl,
  tmdbImage,
} from '../utils/images';

function getCertification(movie) {
  const results = movie?.release_dates?.results || [];
  const release = results.find((item) => item.iso_3166_1 === 'US') || results[0];
  return release?.release_dates?.find((item) => item.certification)?.certification || '';
}

function getProviders(movie) {
  const results = movie?.['watch/providers']?.results || {};
  const region = results.LK ? 'LK' : results.US ? 'US' : Object.keys(results)[0];
  if (!region) return { providers: [], link: '' };

  const data = results[region];
  const seen = new Set();
  const providers = [];
  ['flatrate', 'free', 'ads', 'rent', 'buy'].forEach((type) => {
    (data[type] || []).forEach((provider) => {
      if (!seen.has(provider.provider_id)) {
        seen.add(provider.provider_id);
        providers.push(provider);
      }
    });
  });

  return { providers: providers.slice(0, 7), link: data.link || '' };
}

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const { isInWatchlist, isFavorite, toggleWatchlist, toggleFavorite } = useLibrary();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trailerOpen, setTrailerOpen] = useState(false);

  const [reviews, setReviews] = useState({ reviews: [], count: 0, average: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [form, setForm] = useState({ rating: 0, comment: '' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadMovie = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tmdb.getMovie(id);
      setMovie(data);
      document.title = `${data.title} — MovieExplorer`;
    } catch (err) {
      setError(err.message || 'Could not load this movie.');
      setMovie(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const data = await reviewApi.forMovie(id);
      setReviews(data);
    } catch {
      /* Reviews are optional — never block the page because of them. */
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMovie();
  }, [loadMovie]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setConfirmDelete(false);
  }, [id]);

  const myReview = useMemo(() => {
    if (!user) return null;
    return reviews.reviews.find((review) => String(review.user?.id) === String(user.id)) || null;
  }, [reviews, user]);

  useEffect(() => {
    if (myReview) {
      setForm({ rating: myReview.rating, comment: myReview.comment || '' });
    } else {
      setForm({ rating: 0, comment: '' });
    }
  }, [myReview]);

  const trailerKey = movie ? findTrailer(movie.videos?.results)?.key : null;
  const certification = movie ? getCertification(movie) : '';
  const { providers, link: providerLink } = movie ? getProviders(movie) : { providers: [], link: '' };
  const director = movie?.credits?.crew?.find((person) => person.job === 'Director');
  const writers =
    movie?.credits?.crew?.filter((person) => person.job === 'Screenplay' || person.job === 'Writer').slice(0, 2) ||
    [];
  const cast = movie?.credits?.cast?.slice(0, 12) || [];

  const similar = useMemo(() => {
    if (!movie) return [];
    const combined = [...(movie.recommendations?.results || []), ...(movie.similar?.results || [])];
    const seen = new Set();
    return combined
      .filter((item) => {
        if (!item.poster_path || seen.has(item.id) || item.id === movie.id) return false;
        seen.add(item.id);
        return true;
      })
      .slice(0, 18);
  }, [movie]);

  const requireAuth = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return false;
    }
    return true;
  };

  const handleWatchlist = () => {
    if (!requireAuth()) return;
    toggleWatchlist(movie.id);
  };

  const handleFavorite = () => {
    if (!requireAuth()) return;
    toggleFavorite(movie.id);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title: movie?.title, text: `Check out ${movie?.title} on MovieExplorer`, url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to your clipboard.');
      }
    } catch {
      /* User cancelled the share sheet. */
    }
  };

  const handleReview = async (event) => {
    event.preventDefault();
    if (!requireAuth()) return;

    if (!form.rating) {
      toast.error('Choose a star rating before saving your review.');
      return;
    }

    setSaving(true);
    try {
      await reviewApi.save(movie.id, { rating: form.rating, comment: form.comment });
      toast.success(myReview ? 'Your review was updated.' : 'Thanks for sharing your review!');
      await loadReviews();
    } catch (err) {
      toast.error(err.message || 'Could not save your review.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async () => {
    setSaving(true);
    try {
      await reviewApi.remove(movie.id);
      toast.success('Your review was deleted.');
      setConfirmDelete(false);
      await loadReviews();
    } catch (err) {
      toast.error(err.message || 'Could not delete your review.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page details-page">
        <DetailsSkeleton />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="page details-page">
        <div className="container" style={{ paddingTop: 120 }}>
          <EmptyState
            icon={MessageSquare}
            title="We couldn't find that movie"
            message={error || 'The movie may have been removed from TMDB.'}
            actionLabel="Back to discover"
            actionTo="/search"
          >
            <button type="button" className="btn btn-outline" onClick={loadMovie}>
              <RefreshCw size={16} /> Try again
            </button>
          </EmptyState>
        </div>
      </div>
    );
  }

  const saved = isInWatchlist(movie.id);
  const favorite = isFavorite(movie.id);
  const rating = Number(movie.vote_average) || 0;
  const buckets = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.reviews.filter((review) => Math.ceil(review.rating / 2) === stars).length,
  }));
  const maxBucket = Math.max(...buckets.map((bucket) => bucket.count), 1);

  return (
    <div className="details-page">
      <section className="details-hero">
        {movie.backdrop_path && (
          <img src={backdropUrl(movie.backdrop_path, 'original')} alt="" className="details-backdrop" />
        )}
        <div className="details-shade" />
        <div className="details-topbar container">
          <Link to="/search" className="back-link">
            <ArrowLeft size={16} /> Back to discover
          </Link>
          <span className="details-topbar-title">{movie.title}</span>
        </div>
      </section>

      <div className="container details-layout">
        <aside className="details-poster-col">
          <div className="details-poster">
            <img
              src={posterUrl(movie.poster_path, 'w500')}
              alt={`${movie.title} poster`}
              onError={handleImageError}
            />
          </div>

          <div className="details-score-card">
            <div
              className="score-ring"
              style={{ '--score': `${Math.max(0, Math.min(100, rating * 10))}%` }}
            >
              <span>{rating ? rating.toFixed(1) : '—'}</span>
            </div>
            <div>
              <strong>TMDB score</strong>
              <span>{formatCount(movie.vote_count)} votes</span>
            </div>
          </div>

          <div className="details-side-actions">
            <button
              type="button"
              className={`side-action ${saved ? 'is-active' : ''}`}
              onClick={handleWatchlist}
            >
              {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              {saved ? 'In your watchlist' : 'Add to watchlist'}
            </button>
            <button
              type="button"
              className={`side-action ${favorite ? 'is-active' : ''}`}
              onClick={handleFavorite}
            >
              <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
              {favorite ? 'Favorited' : 'Add to favorites'}
            </button>
            <button type="button" className="side-action" onClick={handleShare}>
              <Share2 size={18} /> Share this movie
            </button>
          </div>
        </aside>

        <div className="details-main">
          <div className="details-kicker">
            {movie.genres?.map((genre) => (
              <Link key={genre.id} to={`/search?genre=${genre.id}`} className="genre-link">
                {genre.name}
              </Link>
            ))}
          </div>

          <h1 className="details-title">{movie.title}</h1>
          {movie.tagline && <p className="details-tagline">“{movie.tagline}”</p>}

          <div className="details-meta">
            {rating > 0 && (
              <span className="details-rating">
                <Star size={14} fill="currentColor" /> {rating.toFixed(1)}
                <em>/10</em>
              </span>
            )}
            <span>
              <Calendar size={14} /> {formatDate(movie.release_date, formatYear(movie.release_date) || '—')}
            </span>
            {movie.runtime > 0 && (
              <span>
                <Clock size={14} /> {formatRuntime(movie.runtime)}
              </span>
            )}
            {certification && <span className="cert-badge">{certification}</span>}
            <span>{formatLanguage(movie.original_language)}</span>
            <span className="quality-badge">HD</span>
          </div>

          <div className="details-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => trailerKey && setTrailerOpen(true)}
              disabled={!trailerKey}
            >
              <Play size={18} fill="currentColor" /> {trailerKey ? 'Watch trailer' : 'No trailer'}
            </button>
            <button
              type="button"
              className="btn btn-glass btn-lg"
              onClick={handleWatchlist}
            >
              {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              {saved ? 'Saved' : 'Watchlist'}
            </button>
            <button
              type="button"
              className={`btn btn-icon btn-lg ${favorite ? 'is-saved' : ''}`}
              onClick={handleFavorite}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              title={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={19} fill={favorite ? 'currentColor' : 'none'} />
            </button>
            {movie.homepage && (
              <a
                href={movie.homepage}
                target="_blank"
                rel="noreferrer"
                className="btn btn-icon btn-lg"
                aria-label="Official website"
                title="Official website"
              >
                <ExternalLink size={19} />
              </a>
            )}
          </div>

          <div className="details-overview">
            <h2>Storyline</h2>
            <p>{movie.overview || 'No overview is available for this movie yet.'}</p>
          </div>

          {(director || writers.length > 0) && (
            <div className="details-credits-line">
              {director && (
                <p>
                  <span>Director</span>{' '}
                  <Link to={`/person/${director.id}`}>{director.name}</Link>
                </p>
              )}
              {writers.length > 0 && (
                <p>
                  <span>Written by</span>{' '}
                  {writers.map((writer, index) => (
                    <span key={writer.id}>
                      <Link to={`/person/${writer.id}`}>{writer.name}</Link>
                      {index < writers.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              )}
            </div>
          )}

          <div className="facts-grid">
            <div className="fact">
              <span>Status</span>
              <strong>{movie.status || '—'}</strong>
            </div>
            <div className="fact">
              <span>Release date</span>
              <strong>{formatDate(movie.release_date)}</strong>
            </div>
            <div className="fact">
              <span>Runtime</span>
              <strong>{formatRuntime(movie.runtime)}</strong>
            </div>
            <div className="fact">
              <span>Original language</span>
              <strong>{formatLanguage(movie.original_language)}</strong>
            </div>
            <div className="fact">
              <span>Budget</span>
              <strong>{formatMoney(movie.budget)}</strong>
            </div>
            <div className="fact">
              <span>Box office</span>
              <strong>{formatMoney(movie.revenue)}</strong>
            </div>
            <div className="fact">
              <span>Production</span>
              <strong>
                {movie.production_companies?.slice(0, 2).map((company) => company.name).join(', ') || '—'}
              </strong>
            </div>
            <div className="fact">
              <span>Country</span>
              <strong>
                {movie.production_countries?.map((country) => country.name).join(', ') || '—'}
              </strong>
            </div>
          </div>

          {providers.length > 0 && (
            <div className="providers-box">
              <div>
                <h3>Where to watch</h3>
                <p>Streaming and rental options may vary by region.</p>
              </div>
              <div className="providers-row">
                {providers.map((provider) => (
                  <span key={provider.provider_id} className="provider-logo" title={provider.provider_name}>
                    <img src={tmdbImage(provider.logo_path, 'w92')} alt={provider.provider_name} loading="lazy" />
                  </span>
                ))}
                {providerLink && (
                  <a href={providerLink} target="_blank" rel="noreferrer" className="provider-link">
                    View options <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {cast.length > 0 && (
        <section className="details-section container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The talent</p>
              <h2>Top cast</h2>
            </div>
            <span className="review-count">
              {formatCount(movie.credits?.cast?.length || 0)} cast members
            </span>
          </div>

          <div className="cast-row">
            {cast.map((person) => (
              <Link to={`/person/${person.id}`} key={`${person.id}-${person.character}`} className="cast-card">
                <img
                  src={profileUrl(person.profile_path, 'w185')}
                  alt={person.name}
                  loading="lazy"
                  onError={handleImageError}
                />
                <strong>{person.name}</strong>
                <span>{person.character || 'Cast'}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="details-section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <MessageSquare size={13} /> Community
            </p>
            <h2>Audience reviews</h2>
          </div>
          <span className="review-count">{reviews.count} review{reviews.count === 1 ? '' : 's'}</span>
        </div>

        <div className="reviews-layout">
          <aside className="review-summary">
            <div className="review-score-big">
              <strong>{reviews.average ? reviews.average.toFixed(1) : '—'}</strong>
              <span>out of 10</span>
            </div>
            <RatingStars value={reviews.average} readOnly size={18} />
            <p className="review-summary-note">
              {reviews.count
                ? `Based on ${reviews.count} community review${reviews.count === 1 ? '' : 's'}.`
                : 'Be the first to review this movie.'}
            </p>

            <div className="rating-bars">
              {buckets.map((bucket) => (
                <div key={bucket.stars} className="rating-bar-row">
                  <span>{bucket.stars}★</span>
                  <div className="rating-bar">
                    <i style={{ width: `${(bucket.count / maxBucket) * 100}%` }} />
                  </div>
                  <em>{bucket.count}</em>
                </div>
              ))}
            </div>
          </aside>

          <div className="reviews-main">
            {isAuthenticated ? (
              <form className="review-form" onSubmit={handleReview}>
                <div className="review-form-head">
                  <div>
                    <h3>{myReview ? 'Update your review' : 'Write a review'}</h3>
                    <p>Share your rating and thoughts with other movie lovers.</p>
                  </div>
                  <div className="rating-picker">
                    <RatingStars
                      value={form.rating}
                      onChange={(value) => setForm((current) => ({ ...current, rating: value }))}
                      size={24}
                      label="Your rating"
                    />
                    <span>{form.rating ? `${form.rating}/10` : 'Tap to rate'}</span>
                  </div>
                </div>

                <textarea
                  value={form.comment}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, comment: event.target.value.slice(0, 800) }))
                  }
                  placeholder="What did you think? No spoilers, please…"
                  rows={4}
                  maxLength={800}
                  aria-label="Your review"
                />

                <div className="review-form-foot">
                  <span>{form.comment.length}/800</span>
                  <div className="review-form-actions">
                    {myReview && (
                      confirmDelete ? (
                        <span className="confirm-inline">
                          Delete this review?
                          <button type="button" className="text-btn text-danger" onClick={handleDeleteReview} disabled={saving}>
                            Yes, delete
                          </button>
                          <button type="button" className="text-btn" onClick={() => setConfirmDelete(false)}>
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="text-btn text-danger"
                          onClick={() => setConfirmDelete(true)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )
                    )}
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <Spinner size={16} /> : null}
                      {myReview ? 'Update review' : 'Post review'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="review-cta">
                <MessageSquare size={26} />
                <div>
                  <h3>Share your take</h3>
                  <p>Sign in to rate this movie and leave a review for the community.</p>
                </div>
                <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary">
                  Sign in to review
                </Link>
              </div>
            )}

            {reviewsLoading ? (
              <div className="review-loading">
                <Spinner size={20} /> Loading reviews…
              </div>
            ) : reviews.reviews.length > 0 ? (
              <div className="review-list">
                {reviews.reviews.map((review) => {
                  const isMine = Boolean(user) && String(review.user?.id) === String(user.id);
                  return (
                    <article key={review.id} className="review-item">
                      <div className="review-avatar">
                        <span>{initials(review.user?.username || '?')}</span>
                        {review.user?.avatar && (
                          <img
                            src={review.user.avatar}
                            alt=""
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div className="review-content">
                        <div className="review-head">
                          <div>
                            <strong>{review.user?.username || 'Anonymous'}</strong>
                            <span>{formatRelative(review.createdAt)}</span>
                          </div>
                          <div className="review-rating">
                            <RatingStars value={review.rating} readOnly size={14} />
                            <em>{review.rating}/10</em>
                          </div>
                        </div>
                        {review.comment && <p>{review.comment}</p>}
                        {isMine && (
                          <button
                            type="button"
                            className="text-btn text-danger review-delete"
                            onClick={() => {
                              setConfirmDelete(true);
                              document
                                .querySelector('.review-form')
                                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                          >
                            <Trash2 size={13} /> Delete my review
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="reviews-empty">
                <MessageSquare size={24} />
                <p>No reviews yet. Start the conversation!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="details-section">
        <MovieRow
          eyebrow="Keep watching"
          title="More like this"
          movies={similar}
          loading={false}
        />
      </div>

      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        videoKey={trailerKey}
        title={movie.title}
      />
    </div>
  );
}
