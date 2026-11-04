const jwt = require('jsonwebtoken');

/**
 * Accepts both `Bearer <token>` and a raw token in the Authorization header.
 */
function verifyToken(req, res, next) {
  const header = req.header('Authorization');
  if (!header) {
    return res.status(401).json({ error: 'Access denied. Please log in.' });
  }

  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : header.trim();

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: verified.id };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Your session is invalid or has expired.' });
  }
}

module.exports = verifyToken;
