import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { libraryApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setWatchlist(user?.watchlist || []);
    setFavorites(user?.favorites || []);
  }, [user]);

  const toggleWatchlist = useCallback(
    async (movieId) => {
      const id = Number(movieId);
      if (!id) return { ok: false };

      if (!isAuthenticated) {
        toast.info('Sign in to build your own watchlist.');
        return { ok: false, reason: 'auth' };
      }

      const wasSaved = watchlist.includes(id);
      const previous = watchlist;
      setWatchlist(wasSaved ? watchlist.filter((item) => item !== id) : [...watchlist, id]);

      try {
        const data = wasSaved
          ? await libraryApi.removeFromWatchlist(id)
          : await libraryApi.addToWatchlist(id);
        setWatchlist(data.watchlist || []);
        setFavorites(data.favorites || []);
        toast.success(wasSaved ? 'Removed from your watchlist.' : 'Added to your watchlist.');
        return { ok: true, added: !wasSaved };
      } catch (error) {
        setWatchlist(previous);
        if (error.status !== 401) toast.error(error.message);
        return { ok: false, reason: error.status === 401 ? 'auth' : 'error' };
      }
    },
    [watchlist, isAuthenticated, toast]
  );

  const toggleFavorite = useCallback(
    async (movieId) => {
      const id = Number(movieId);
      if (!id) return { ok: false };

      if (!isAuthenticated) {
        toast.info('Sign in to save your favorite movies.');
        return { ok: false, reason: 'auth' };
      }

      const wasSaved = favorites.includes(id);
      const previous = favorites;
      setFavorites(wasSaved ? favorites.filter((item) => item !== id) : [...favorites, id]);

      try {
        const data = wasSaved
          ? await libraryApi.removeFromFavorites(id)
          : await libraryApi.addToFavorites(id);
        setWatchlist(data.watchlist || []);
        setFavorites(data.favorites || []);
        toast.success(wasSaved ? 'Removed from favorites.' : 'Added to favorites.');
        return { ok: true, added: !wasSaved };
      } catch (error) {
        setFavorites(previous);
        if (error.status !== 401) toast.error(error.message);
        return { ok: false, reason: error.status === 401 ? 'auth' : 'error' };
      }
    },
    [favorites, isAuthenticated, toast]
  );

  const removeFromWatchlist = useCallback(
    (movieId) => {
      if (watchlist.includes(Number(movieId))) return toggleWatchlist(movieId);
      return Promise.resolve({ ok: true });
    },
    [watchlist, toggleWatchlist]
  );

  const removeFromFavorites = useCallback(
    (movieId) => {
      if (favorites.includes(Number(movieId))) return toggleFavorite(movieId);
      return Promise.resolve({ ok: true });
    },
    [favorites, toggleFavorite]
  );

  const isInWatchlist = useCallback(
    (movieId) => watchlist.includes(Number(movieId)),
    [watchlist]
  );

  const isFavorite = useCallback(
    (movieId) => favorites.includes(Number(movieId)),
    [favorites]
  );

  const value = useMemo(
    () => ({
      watchlist,
      favorites,
      watchlistCount: watchlist.length,
      favoritesCount: favorites.length,
      isInWatchlist,
      isFavorite,
      toggleWatchlist,
      toggleFavorite,
      removeFromWatchlist,
      removeFromFavorites,
    }),
    [
      watchlist,
      favorites,
      isInWatchlist,
      isFavorite,
      toggleWatchlist,
      toggleFavorite,
      removeFromWatchlist,
      removeFromFavorites,
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used inside a LibraryProvider');
  return context;
}
