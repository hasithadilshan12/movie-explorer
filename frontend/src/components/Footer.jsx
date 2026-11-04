import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Brand from './Brand';
import { GENRES } from '../utils/constants';

const YEAR = new Date().getFullYear();

function GithubIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.14c-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.4-5.25 5.68.41.35.78 1.05.78 2.12v3.14c0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.81-5.96 6.81H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.22 5.46-6.22zm-1.16 17.52h1.83L7.01 4.13H5.05l12.03 15.64z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.12-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.52A3 3 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3 3 0 0 0 2.12 2.13c1.88.52 9.38.52 9.38.52s7.5 0 9.38-.52a3 3 0 0 0 2.12-2.13C24 15.93 24 12 24 12s0-3.93-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-brand">
          <Brand />
          <p>
            Discover films you will love, build your personal watchlist, and share your take with a
            community of movie lovers.
          </p>
          <div className="socials" aria-label="Social links">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
              <GithubIcon />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
              <XIcon />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <YoutubeIcon />
            </a>
            <a href="mailto:hello@movieexplorer.app" aria-label="Email">
              <Mail size={17} />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/search">Discover movies</Link>
          <Link to="/search?sort=vote_average.desc&rating=7">Top rated</Link>
          <Link to="/search?sort=primary_release_date.desc">New releases</Link>
        </div>

        <div className="footer-col">
          <h4>Genres</h4>
          {GENRES.slice(0, 5).map((genre) => (
            <Link key={genre.id} to={`/search?genre=${genre.id}`}>
              {genre.name}
            </Link>
          ))}
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/watchlist">My watchlist</Link>
          <Link to="/watchlist?tab=favorites">Favorites</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/login">Sign in</Link>
        </div>
      </div>

      <div className="footer-bottom container">
        <p>© {YEAR} MovieExplorer. Built for the love of cinema.</p>
        <p className="footer-attribution">
          Movie data and images from{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            TMDB
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  );
}
