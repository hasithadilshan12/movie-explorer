import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, Compass, RefreshCw, TrendingUp } from 'lucide-react';
import Hero from '../components/Hero';
import MovieRow from '../components/MovieRow';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { tmdb } from '../services/tmdb';
import { GENRES } from '../utils/constants';
import { backdropUrl, posterUrl } from '../utils/images';

const EMPTY = {
  trending: [],
  popular: [],
  topRated: [],
  nowPlaying: [],
  upcoming: [],
};

const GENRE_TILES = GENRES.slice(0, 10);

export default function Home() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [genreArt, setGenreArt] = useState({});
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const { watchlistCount } = useLibrary();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const results = await Promise.allSettled([
      tmdb.trending('week'),
      tmdb.popular(),
      tmdb.topRated(),
      tmdb.nowPlaying(),
      tmdb.upcoming(),
    ]);

    const keys = ['trending', 'popular', 'topRated', 'nowPlaying', 'upcoming'];
    const next = { ...EMPTY };

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        next[keys[index]] = (result.value.results || []).filter((movie) => movie.poster_path);
      }
    });

    setData(next);
    setLoading(false);

    if (!next.trending.length && !next.popular.length) {
      setError(
        results.find((result) => result.status === 'rejected')?.reason?.message ||
          'Could not load movies right now.'
      );
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    document.title = 'MovieExplorer — Discover movies you\'ll love';
  }, []);

  // Genre tiles look far better with a real still behind them. TMDB has no
  // genre artwork, so we borrow the backdrop of each genre's most popular film.
  useEffect(() => {
    let cancelled = false;

    Promise.allSettled(
      GENRE_TILES.map((genre) =>
        tmdb
          .discover({
            with_genres: genre.id,
            sort_by: 'popularity.desc',
            'vote_count.gte': 150,
          })
          .then((result) => ({
            genreId: genre.id,
            candidates: (result.results || [])
              .filter((movie) => movie.backdrop_path)
              .slice(0, 8)
              .map((movie) => movie.backdrop_path),
          }))
      )
    ).then((results) => {
      if (cancelled) return;

      // Different genres often share their most popular film, which would show
      // the same still twice. Walk each genre's candidates and claim unique art.
      const art = {};
      const used = new Set();

      results.forEach((result) => {
        if (result.status !== 'fulfilled') return;
        const { genreId, candidates } = result.value;
        const pick = candidates.find((path) => !used.has(path));
        if (pick) {
          art[genreId] = pick;
          used.add(pick);
        }
      });

      setGenreArt(art);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const ctaPosters = (data.trending.length ? data.trending : data.popular).slice(0, 3);

  return (
    <div className="home">
      <Hero movies={data.trending} loading={loading && !data.trending.length} />

      <div className="home-body">
        {error && !loading && (
          <div className="container">
            <div className="alert-banner alert-error">
              <div>
                <strong>We hit a small snag</strong>
                <p>{error}</p>
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={load}>
                <RefreshCw size={15} /> Try again
              </button>
            </div>
          </div>
        )}

        <MovieRow
          eyebrow="Everyone is watching"
          title="Trending this week"
          subtitle="The films dominating conversations right now."
          movies={data.trending}
          loading={loading}
          viewAll="/search?sort=popularity.desc"
        />

        <MovieRow
          eyebrow="Crowd favorites"
          title="Popular right now"
          movies={data.popular}
          loading={loading}
          viewAll="/search?sort=popularity.desc"
        />

        <MovieRow
          eyebrow="The greats"
          title="Top rated of all time"
          subtitle="Masterpieces that stand the test of time."
          movies={data.topRated}
          loading={loading}
          viewAll="/search?sort=vote_average.desc&rating=7"
        />

        <MovieRow
          eyebrow="On the big screen"
          title="In theatres now"
          movies={data.nowPlaying}
          loading={loading}
          viewAll="/search?sort=primary_release_date.desc"
        />

        <MovieRow
          eyebrow="Coming soon"
          title="Upcoming releases"
          movies={data.upcoming}
          loading={loading}
          viewAll="/search?sort=primary_release_date.desc"
        />

        <section className="genre-section container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <Compass size={13} /> Find your mood
              </p>
              <h2>Browse by genre</h2>
              <p className="section-lead">From adrenaline-pumping action to quiet character drama.</p>
            </div>
            <Link to="/search" className="shelf-link">
              Explore everything <ArrowRight size={15} />
            </Link>
          </div>

          <div className="genre-grid">
            {GENRE_TILES.map((genre, index) => {
              const art = genreArt[genre.id];

              return (
                <Link
                  key={genre.id}
                  to={`/search?genre=${genre.id}`}
                  className={`genre-tile genre-tile-${index % 5}${art ? ' has-image' : ''}`}
                  style={art ? { '--genre-image': `url(${backdropUrl(art, 'w780')})` } : undefined}
                >
                  <span className="genre-tile-media" aria-hidden="true" />
                  <span className="genre-tile-name">{genre.name}</span>
                  <span className="genre-tile-arrow">
                    <ArrowRight size={16} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="cta-banner container">
          <div className="cta-copy">
            <p className="eyebrow">
              <TrendingUp size={13} /> Your personal cinema
            </p>
            <h2>{isAuthenticated ? 'Your collection is growing' : 'Never lose a movie again'}</h2>
            <p>
              {isAuthenticated
                ? `You have ${watchlistCount} title${watchlistCount === 1 ? '' : 's'} saved. Keep exploring and add your next great watch.`
                : 'Create a free account to save films, keep favorites, and rate everything you watch.'}
            </p>
            <div className="cta-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/watchlist" className="btn btn-primary">
                    <Bookmark size={17} /> Open my watchlist
                  </Link>
                  <Link to="/search" className="btn btn-glass">
                    Discover more
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary">
                    Create free account
                  </Link>
                  <Link to="/login" className="btn btn-glass">
                    I already have one
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="cta-art" aria-hidden="true">
            {ctaPosters.map((movie, index) => (
              <img
                key={movie.id}
                src={posterUrl(movie.poster_path, 'w342')}
                alt=""
                className={`cta-poster cta-poster-${index}`}
                loading="lazy"
              />
            ))}
            <div className="cta-glow" />
          </div>
        </section>
      </div>
    </div>
  );
}
