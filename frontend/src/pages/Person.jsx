import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Cake, MapPin, RefreshCw } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import EmptyState from '../components/EmptyState';
import { GridSkeleton } from '../components/Loader';
import { tmdb } from '../services/tmdb';
import { formatDate, formatYear } from '../utils/format';
import { handleImageError, profileUrl } from '../utils/images';

export default function Person() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    tmdb
      .getPerson(id)
      .then((data) => {
        if (cancelled) return;
        setPerson(data);
        document.title = `${data.name} — MovieExplorer`;
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load this person.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const credits = useMemo(() => {
    if (!person) return [];
    const combined = [...(person.combined_credits?.cast || []), ...(person.combined_credits?.crew || [])];
    const seen = new Set();
    return combined
      .filter((credit) => {
        if (credit.media_type !== 'movie' || !credit.poster_path || seen.has(credit.id)) return false;
        seen.add(credit.id);
        return true;
      })
      .sort((a, b) => {
        const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
        const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 36);
  }, [person]);

  if (loading) {
    return (
      <div className="page person-page">
        <div className="container" style={{ paddingTop: 130 }}>
          <div className="skeleton skeleton-line" style={{ width: 260, height: 38 }} />
          <div className="skeleton skeleton-line" style={{ width: 180, height: 18, marginTop: 18 }} />
          <GridSkeleton count={12} />
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="page person-page">
        <div className="container" style={{ paddingTop: 130 }}>
          <EmptyState
            title="Person not found"
            message={error || 'We could not load this profile.'}
            actionLabel="Back to discover"
            actionTo="/search"
          >
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Go back
            </button>
          </EmptyState>
        </div>
      </div>
    );
  }

  const biography = person.biography || 'No biography is available for this person yet.';
  const isLongBio = biography.length > 420;

  return (
    <div className="page person-page">
      <div className="container">
        <div className="person-hero">
          <div className="person-photo">
            <img
              src={profileUrl(person.profile_path, 'h632')}
              alt={person.name}
              onError={handleImageError}
            />
          </div>

          <div className="person-info">
            <Link to="/search" className="back-link back-link-dark">
              <ArrowLeft size={15} /> Back to discover
            </Link>
            <h1>{person.name}</h1>
            <p className="person-role">
              {person.known_for_department || 'Film industry'}
              {person.place_of_birth ? ` · ${person.place_of_birth}` : ''}
            </p>

            <div className="person-facts">
              {person.birthday && (
                <span>
                  <Cake size={14} /> Born {formatDate(person.birthday)}
                </span>
              )}
              {person.place_of_birth && (
                <span>
                  <MapPin size={14} /> {person.place_of_birth}
                </span>
              )}
              <span>{credits.length} movie credits</span>
            </div>

            <div className="person-bio">
              <p>{isLongBio && !expanded ? `${biography.slice(0, 420).trimEnd()}…` : biography}</p>
              {isLongBio && (
                <button type="button" className="text-btn" onClick={() => setExpanded((value) => !value)}>
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="section-heading" style={{ marginTop: 54 }}>
          <div>
            <p className="eyebrow">Filmography</p>
            <h2>Known for</h2>
          </div>
          <span className="review-count">{credits.length} movies</span>
        </div>

        {credits.length > 0 ? (
          <div className="movie-grid">
            {credits.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <EmptyState title="No movie credits yet" message="This person has no movie credits we can show." />
        )}

        <div className="person-footer">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            <RefreshCw size={15} /> Go back
          </button>
          <span>
            {person.birthday ? `Born ${formatYear(person.birthday)}` : 'Biography from TMDB'}
          </span>
        </div>
      </div>
    </div>
  );
}
