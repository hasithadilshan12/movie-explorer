const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // TMDB movie ID
    movieId: {
      type: Number,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 800,
      default: '',
    },
  },
  { timestamps: true }
);

// A user can leave only one review per movie.
ReviewSchema.index({ user: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
