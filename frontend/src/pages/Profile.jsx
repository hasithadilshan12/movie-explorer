import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  Bookmark,
  CalendarDays,
  Check,
  Film,
  Heart,
  LogOut,
  Mail,
  MessageSquare,
  Pencil,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { Spinner } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { reviewApi } from '../services/api';
import { tmdb } from '../services/tmdb';
import { formatDate, formatRelative, initials } from '../utils/format';
import { handleImageError, posterUrl } from '../utils/images';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const { watchlistCount, favoritesCount } = useLibrary();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [reviews, setReviews] = useState([]);
  const [reviewMovies, setReviewMovies] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Your profile — MovieExplorer';
  }, []);

  useEffect(() => {
    let cancelled = false;

    reviewApi
      .mine()
      .then(async (data) => {
        if (cancelled) return;
        const list = data.reviews || [];
        setReviews(list);

        const ids = [...new Set(list.map((review) => review.movieId))].slice(0, 6);
        const results = await Promise.allSettled(ids.map((id) => tmdb.getMovie(id)));
        if (cancelled) return;

        const map = {};
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') map[ids[index]] = result.value;
        });
        setReviewMovies(map);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError('');

    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 24) {
      setFormError('Username must be between 3 and 24 characters.');
      return;
    }

    if (trimmed === user.username) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ username: trimmed });
      toast.success('Your profile was updated.');
      setEditing(false);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('You have been signed out.');
  };

  if (!user) return null;

  return (
    <div className="page profile-page">
      <div className="container">
        <section className="profile-hero">
          <div className="profile-identity">
            <div className="profile-avatar">
              <span>{initials(user.username)}</span>
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>

            <div>
              <p className="eyebrow">
                <Sparkles size={13} /> Movie Explorer member
              </p>
              <h1>{user.username}</h1>
              <p className="profile-email">
                <Mail size={14} /> {user.email || 'No email on this account'}
              </p>
              <div className="profile-badges">
                <span className="profile-badge">
                  <CalendarDays size={13} /> Joined {formatDate(user.createdAt)}
                </span>
                <span className="profile-badge">
                  {user.isGoogleAccount ? <BadgeCheck size={13} /> : <ShieldCheck size={13} />}
                  {user.isGoogleAccount ? 'Google account' : 'Email account'}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-hero-actions">
            <button type="button" className="btn btn-outline" onClick={() => setEditing(true)}>
              <Pencil size={15} /> Edit profile
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </section>

        <div className="profile-stats">
          <Link to="/watchlist" className="profile-stat-card">
            <span className="profile-stat-icon">
              <Bookmark size={19} />
            </span>
            <div>
              <strong>{watchlistCount}</strong>
              <span>Watchlist titles</span>
            </div>
            <em>View</em>
          </Link>
          <Link to="/watchlist?tab=favorites" className="profile-stat-card">
            <span className="profile-stat-icon">
              <Heart size={19} />
            </span>
            <div>
              <strong>{favoritesCount}</strong>
              <span>Favorite movies</span>
            </div>
            <em>View</em>
          </Link>
          <div className="profile-stat-card">
            <span className="profile-stat-icon">
              <MessageSquare size={19} />
            </span>
            <div>
              <strong>{reviews.length}</strong>
              <span>Reviews written</span>
            </div>
            <em>Community</em>
          </div>
        </div>

        <div className="profile-grid">
          <section className="profile-card">
            <div className="profile-card-head">
              <div>
                <h2>Recent reviews</h2>
                <p>Your latest thoughts for the community.</p>
              </div>
              <MessageSquare size={19} />
            </div>

            {reviewsLoading ? (
              <div className="profile-loading">
                <Spinner size={18} /> Loading your reviews…
              </div>
            ) : reviews.length > 0 ? (
              <div className="profile-reviews">
                {reviews.slice(0, 6).map((review) => {
                  const movie = reviewMovies[review.movieId];
                  return (
                    <Link
                      key={review.id}
                      to={`/movie/${review.movieId}`}
                      className="profile-review"
                    >
                      <img
                        src={posterUrl(movie?.poster_path, 'w200')}
                        alt=""
                        loading="lazy"
                        onError={handleImageError}
                      />
                      <div>
                        <strong>{movie?.title || `Movie #${review.movieId}`}</strong>
                        <span className="profile-review-meta">
                          <span className="profile-review-rating">
                            <Star size={11} fill="currentColor" /> {review.rating}/10
                          </span>
                          · {formatRelative(review.createdAt)}
                        </span>
                        {review.comment && <p>{review.comment}</p>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="No reviews yet"
                message="Rate a movie you have watched and your review will appear here."
                actionLabel="Find a movie"
                actionTo="/search"
              />
            )}
          </section>

          <aside className="profile-side">
            <section className="profile-card">
              <div className="profile-card-head">
                <div>
                  <h2>Account details</h2>
                  <p>Your MovieExplorer account information.</p>
                </div>
                <ShieldCheck size={19} />
              </div>

              <dl className="account-list">
                <div>
                  <dt>Username</dt>
                  <dd>{user.username}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{user.email || '—'}</dd>
                </div>
                <div>
                  <dt>Sign-in method</dt>
                  <dd>{user.isGoogleAccount ? 'Google' : 'Email & password'}</dd>
                </div>
                <div>
                  <dt>Member since</dt>
                  <dd>{formatDate(user.createdAt)}</dd>
                </div>
              </dl>

              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => setEditing(true)}
              >
                <Pencil size={15} /> Change username
              </button>
            </section>

            <section className="profile-tip">
              <Film size={22} />
              <div>
                <h3>Keep exploring</h3>
                <p>Your next favorite movie is only a search away.</p>
                <Link to="/search" className="text-btn">
                  Browse movies →
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && setEditing(false)}>
          <div className="edit-modal" role="dialog" aria-modal="true" aria-label="Edit profile">
            <div className="edit-modal-head">
              <div>
                <h2>Edit profile</h2>
                <p>Choose the name other movie fans will see.</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setEditing(false)} aria-label="Close" title="Close">
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSave} className="auth-form">
              {formError && <div className="form-alert">{formError}</div>}
              <label className="field">
                <span>Username</span>
                <div className="input-wrap">
                  <Check size={17} />
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Your username"
                    maxLength={24}
                    autoFocus
                  />
                </div>
              </label>
              <p className="edit-hint">3–24 characters. Letters, numbers and underscores only.</p>

              <div className="edit-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving && <Spinner size={16} />} Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
