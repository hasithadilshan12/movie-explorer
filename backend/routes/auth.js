const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email || '',
    avatar: user.avatar || '',
    watchlist: user.watchlist || [],
    favorites: user.favorites || [],
    hasPassword: Boolean(user.password),
    isGoogleAccount: Boolean(user.googleId),
    createdAt: user.createdAt,
  };
}

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

/* ------------------------------------------------------------------ */
/*  1. REGISTER                                                        */
/* ------------------------------------------------------------------ */
router.post('/register', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({
        error: 'Username must be 3–24 characters (letters, numbers, underscore).',
      });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({
      $or: [{ username }, { email }],
    }).select('username email');

    if (existing) {
      if (existing.email === email) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      return res.status(409).json({ error: 'This username is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    return res.status(201).json({
      message: 'Account created successfully.',
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Username or email is already in use.' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Could not create your account.' });
  }
});

/* ------------------------------------------------------------------ */
/*  2. LOGIN (email or username)                                       */
/* ------------------------------------------------------------------ */
router.post('/login', async (req, res) => {
  try {
    const identifier = String(req.body.identifier || req.body.email || req.body.username || '').trim();
    const password = String(req.body.password || '');

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter your email/username and password.' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'No account found with those details.' });
    }

    if (!user.password) {
      return res.status(400).json({
        error: 'This account uses Google sign-in. Please continue with Google.',
        code: 'GOOGLE_ACCOUNT',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    return res.json({
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Could not log you in.' });
  }
});

/* ------------------------------------------------------------------ */
/*  3. GOOGLE SIGN-IN                                                  */
/* ------------------------------------------------------------------ */
let googleClient = null;
function getGoogleClient() {
  if (!process.env.GOOGLE_CLIENT_ID) return null;
  if (!googleClient) googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  return googleClient;
}

router.post('/google', async (req, res) => {
  try {
    const client = getGoogleClient();
    if (!client) {
      return res.status(503).json({
        error:
          'Google sign-in is not configured. Add GOOGLE_CLIENT_ID to the backend .env file.',
        code: 'GOOGLE_NOT_CONFIGURED',
      });
    }

    const credential = req.body.credential;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential.' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Google did not return a valid email address.' });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email }],
    });

    if (!user) {
      const base = (email.split('@')[0] || 'cinephile')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .slice(0, 20) || 'cinephile';

      let username = base;
      let suffix = 1;
      while (await User.exists({ username })) {
        username = `${base}${suffix}`.slice(0, 24);
        suffix += 1;
      }

      user = await User.create({
        username,
        email,
        googleId: payload.sub,
        avatar: payload.picture || '',
        password: undefined,
      });
    } else {
      // Link the Google account to an existing email account.
      let changed = false;
      if (!user.googleId) {
        user.googleId = payload.sub;
        changed = true;
      }
      if (!user.avatar && payload.picture) {
        user.avatar = payload.picture;
        changed = true;
      }
      if (changed) await user.save();
    }

    return res.json({
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Google auth error:', err.message);
    return res.status(401).json({ error: 'Google sign-in failed. Please try again.' });
  }
});

/* ------------------------------------------------------------------ */
/*  4. CURRENT USER                                                    */
/* ------------------------------------------------------------------ */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ error: 'Could not load your profile.' });
  }
});

/* ------------------------------------------------------------------ */
/*  5. UPDATE PROFILE                                                  */
/* ------------------------------------------------------------------ */
router.patch('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Account not found.' });

    if (typeof req.body.username === 'string') {
      const username = req.body.username.trim();
      if (!USERNAME_RE.test(username)) {
        return res.status(400).json({
          error: 'Username must be 3–24 characters (letters, numbers, underscore).',
        });
      }
      const taken = await User.exists({ username, _id: { $ne: user._id } });
      if (taken) return res.status(409).json({ error: 'This username is already taken.' });
      user.username = username;
    }

    await user.save();
    return res.json({ message: 'Profile updated.', user: publicUser(user) });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Could not update your profile.' });
  }
});

module.exports = router;
