const app = require('../app');
const { connectDB } = require('../db');

/**
 * Vercel mounts this catch-all function under /api, while Express routes are
 * defined at the root (for example /auth/login). Strip the prefix when Vercel
 * keeps it, then hand the request to Express.
 */
module.exports = async (req, res) => {
  const url = req.url || '/';

  if (url.startsWith('/api/')) {
    req.url = url.slice(4);
  } else if (url === '/api' || url.startsWith('/api?')) {
    req.url = `/${url.slice(4)}`;
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(503).json({ error: 'Database unavailable. Please try again shortly.' });
    return;
  }

  return app(req, res);
};
