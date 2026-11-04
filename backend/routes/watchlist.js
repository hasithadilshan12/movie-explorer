const express = require('express');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

function parseMovieId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/* ------------------------------------------------------------------ */
/*  GET /watchlist  ->  { watchlist: [], favorites: [] }              */
/* ------------------------------------------------------------------ */
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('watchlist favorites');
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    return res.json({
      watchlist: user.watchlist || [],
      favorites: user.favorites || [],
    });
  } catch (err) {
    return res.status(500).json({ error: 'Could not load your library.' });
  }
});

/* ------------------------------------------------------------------ */
/*  WATCHLIST                                                         */
/* ------------------------------------------------------------------ */
router.post('/add', verifyToken, async (req, res) => {
  try {
    const movieId = parseMovieId(req.body.movieId);
    if (!movieId) return res.status(400).json({ error: 'A valid movieId is required.' });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { watchlist: movieId } },
      { new: true, select: 'watchlist favorites' }
    );
    if (!user) return res.status(404).json({ error: 'Account not found.' });

    return res.json({
      message: 'Added to watchlist.',
      watchlist: user.watchlist,
      favorites: user.favorites,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Could not update your watchlist.' });
  }
});

router.delete('/:movieId', verifyToken, async (req, res) => {
  try {
    const movieId = parseMovieId(req.params.movieId);
    if (!movieId) return res.status(400).json({ error: 'A valid movieId is required.' });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { watchlist: movieId } },
      { new: true, select: 'watchlist favorites' }
    );
    if (!user) return res.status(404).json({ error: 'Account not found.' });

    return res.json({
      message: 'Removed from watchlist.',
      watchlist: user.watchlist,
      favorites: user.favorites,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Could not update your watchlist.' });
  }
});

/* ------------------------------------------------------------------ */
/*  FAVORITES                                                         */
/* ------------------------------------------------------------------ */
router.post('/favorites/add', verifyToken, async (req, res) => {
  try {
    const movieId = parseMovieId(req.body.movieId);
    if (!movieId) return res.status(400).json({ error: 'A valid movieId is required.' });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favorites: movieId } },
      { new: true, select: 'watchlist favorites' }
    );
    if (!user) return res.status(404).json({ error: 'Account not found.' });

    return res.json({
      message: 'Added to favorites.',
      watchlist: user.watchlist,
      favorites: user.favorites,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Could not update your favorites.' });
  }
});

router.delete('/favorites/:movieId', verifyToken, async (req, res) => {
  try {
    const movieId = parseMovieId(req.params.movieId);
    if (!movieId) return res.status(400).json({ error: 'A valid movieId is required.' });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: movieId } },
      { new: true, select: 'watchlist favorites' }
    );
    if (!user) return res.status(404).json({ error: 'Account not found.' });

    return res.json({
      message: 'Removed from favorites.',
      watchlist: user.watchlist,
      favorites: user.favorites,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Could not update your favorites.' });
  }
});

module.exports = router;
