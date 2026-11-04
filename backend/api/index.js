const app = require('../app');
const { connectDB } = require('../db');

/**
 * All requests are routed here by backend/vercel.json. Vercel mounts the
 * function under /api, while Express routes live at the root (for example
 * /auth/login), so strip the prefix when it is present.
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
