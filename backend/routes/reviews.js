const express = require('express');
const Review = require('../models/Review');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

function parseMovieId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function shapeReview(review) {
  return {
    id: review._id,
    movieId: review.movieId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    user: review.user
      ? {
          id: review.user._id,
          username: review.user.username,
          avatar: review.user.avatar || '',
        }
      : null,
  };
}

/* ------------------------------------------------------------------ */
/*  GET /reviews/mine  -> reviews written by the logged in user       */
/* ------------------------------------------------------------------ */
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar');
    return res.json({ reviews: reviews.map(shapeReview) });
  } catch (err) {
    return res.status(500).json({ error: 'Could not load your reviews.' });
  }
});

/* ------------------------------------------------------------------ */
/*  GET /reviews/:movieId                                            */
/* ------------------------------------------------------------------ */
router.get('/:movieId', async (req, res) => {
  try {
    const movieId = parseMovieId(req.params.movieId);
    if (!movieId) return res.status(400).json({ error: 'A valid movieId is required.' });

    const reviews = await Review.find({ movieId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'username avatar');

    const count = reviews.length;
    const average = count
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / count
      : 0;

    return res.json({
      reviews: reviews.map(shapeReview),
      count,
      average: Number(average.toFixed(1)),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Could not load reviews.' });
  }
});

/* ------------------------------------------------------------------ */
/*  POST /reviews/:movieId  (create or update your review)            */
/* ------------------------------------------------------------------ */
router.post('/:movieId', verifyToken, async (req, res) => {
  try {
    const movieId = parseMovieId(req.params.movieId);
    if (!movieId) return res.status(400).json({ error: 'A valid movieId is required.' });

    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim();

    if (!Number.isFinite(rating) || rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10.' });
    }
    if (comment.length > 800) {
      return res.status(400).json({ error: 'Review must be 800 characters or fewer.' });
    }

    const review = await Review.findOneAndUpdate(
      { user: req.user.id, movieId },
      { rating, comment },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('user', 'username avatar');

    return res.status(201).json({
      message: 'Review saved.',
      review: shapeReview(review),
    });
  } catch (err) {
    console.error('Review save error:', err);
    return res.status(500).json({ error: 'Could not save your review.' });
  }
});

/* ------------------------------------------------------------------ */
/*  DELETE /reviews/:movieId                                          */
/* ------------------------------------------------------------------ */
router.delete('/:movieId', verifyToken, async (req, res) => {
  try {
    const movieId = parseMovieId(req.params.movieId);
    if (!movieId) return res.status(400).json({ error: 'A valid movieId is required.' });

    await Review.findOneAndDelete({ user: req.user.id, movieId });
    return res.json({ message: 'Review deleted.' });
  } catch (err) {
    return res.status(500).json({ error: 'Could not delete your review.' });
  }
});

module.exports = router;
