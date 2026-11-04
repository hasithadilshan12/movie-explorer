import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Bookmark,
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Search,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import Brand from './Brand';
import SearchOverlay from './SearchOverlay';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { initials } from '../utils/format';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/search', label: 'Discover' },
  { to: '/watchlist', label: 'My List' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { watchlistCount } = useLibrary();
  const toast = useToast();
  const location = useLocation();

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', menuOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [menuOpen]);

  useEffect(() => {
    const handleKey = (event) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((event.key === '/' && !isTyping) || ((event.metaKey || event.ctrlKey) && event.key === 'k')) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const handleOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setUserMenuOpen(false);
    toast.success('You have been signed out.');
  };

  const displayName = user?.username || 'Account';

  return (
    <>
      <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="navbar-inner container">
          <Brand />

          <nav className="nav-links" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
              >
                {link.label}
                {link.to === '/watchlist' && isAuthenticated && watchlistCount > 0 && (
                  <span className="nav-count">{watchlistCount}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="nav-right">
            <button
              type="button"
              className="search-trigger"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
            >
              <Search size={17} />
              <span>Search movies</span>
              <kbd>/</kbd>
            </button>

            {isAuthenticated ? (
              <div className="user-menu-wrap" ref={userMenuRef}>
                <button
                  type="button"
                  className={`avatar-btn ${userMenuOpen ? 'is-open' : ''}`}
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="avatar">
                    <span className="avatar-fallback">{initials(displayName)}</span>
                    {user?.avatar && (
                      <img
                        src={user.avatar}
                        alt=""
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </span>
                  <span className="avatar-name">{displayName}</span>
                  <ChevronDown size={15} className={userMenuOpen ? 'rotate' : ''} />
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown" role="menu">
                    <div className="user-dropdown-head">
                      <strong>{displayName}</strong>
                      <span>{user?.email || 'Movie Explorer member'}</span>
                    </div>
                    <Link to="/profile" role="menuitem" className="dropdown-item">
                      <User size={16} /> Profile
                    </Link>
                    <Link to="/watchlist" role="menuitem" className="dropdown-item">
                      <Bookmark size={16} /> My watchlist
                      {watchlistCount > 0 && <span className="dropdown-count">{watchlistCount}</span>}
                    </Link>
                    <Link to="/watchlist?tab=favorites" role="menuitem" className="dropdown-item">
                      <Heart size={16} /> Favorites
                    </Link>
                    <div className="dropdown-sep" />
                    <button type="button" className="dropdown-item" role="menuitem" onClick={handleLogout}>
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-actions">
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <Sparkles size={15} />
                  Sign up
                </Link>
              </div>
            )}

            <button
              type="button"
              className="hamburger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="mobile-menu-head container">
            <Brand />
            <button
              type="button"
              className="icon-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <div className="mobile-menu-body container">
            <button
              type="button"
              className="mobile-search"
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
            >
              <Search size={18} /> Search movies <span>/</span>
            </button>

            <nav className="mobile-nav">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`}
                >
                  {link.label}
                  <span>→</span>
                </NavLink>
              ))}
              {isAuthenticated && (
                <NavLink to="/profile" className="mobile-nav-link">
                  Profile <span>→</span>
                </NavLink>
              )}
            </nav>

            <div className="mobile-auth">
              {isAuthenticated ? (
                <button type="button" className="btn btn-outline btn-block" onClick={handleLogout}>
                  <LogOut size={17} /> Sign out ({displayName})
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline btn-block">
                    Log in
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-block">
                    Create free account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  );
}
