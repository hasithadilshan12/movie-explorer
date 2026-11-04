const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    // Optional: users who sign in with Google do not have a password.
    password: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    // TMDB movie IDs
    watchlist: [{ type: Number }],
    favorites: [{ type: Number }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
