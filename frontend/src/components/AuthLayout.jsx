import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bookmark, MessageSquare, Star } from 'lucide-react';
import Brand from './Brand';
import { tmdb } from '../services/tmdb';
import { backdropUrl } from '../utils/images';

const FEATURES = [
  { icon: Star, title: 'Curated discovery', text: 'Trending, top rated and hidden gems in one place.' },
  { icon: Bookmark, title: 'Your own watchlist', text: 'Save films and keep your favorites in sync.' },
  { icon: MessageSquare, title: 'Real opinions', text: 'Rate and review every movie you watch.' },
];

export default function AuthLayout({ children }) {
  const [backdrops, setBackdrops] = useState([]);

  useEffect(() => {
    let cancelled = false;
    tmdb
      .trending('week')
      .then((data) => {
        if (cancelled) return;
        const images = (data.results || [])
          .filter((movie) => movie.backdrop_path)
          .slice(0, 3)
          .map((movie) => movie.backdrop_path);
        setBackdrops(images);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="auth-page">
      <aside className="auth-visual">
        <div className="auth-visual-media" aria-hidden="true">
          {backdrops.map((path, index) => (
            <img
              key={path}
              src={backdropUrl(path)}
              alt=""
              className={`auth-visual-img auth-visual-img-${index}`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
          <div className="auth-visual-shade" />
        </div>

        <div className="auth-visual-top">
          <Brand />
        </div>

        <div className="auth-visual-content">
          <p className="eyebrow">
            <span className="live-dot" /> Your next favorite film is waiting
          </p>
          <h1>
            Every movie.
            <br />
            One place.
          </h1>
          <p className="auth-visual-lead">
            A beautiful home for everything you love about cinema — discover, save and discuss.
          </p>

          <ul className="auth-features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="auth-feature-icon">
                  <Icon size={18} />
                </span>
                <span>
                  <strong>{title}</strong>
                  <em>{text}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-visual-foot">Movie data powered by TMDB · Made for movie lovers</p>
      </aside>

      <main className="auth-panel">
        <Link to="/" className="auth-home-link">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
