const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'aerodigital-seo-audit-secret-key-2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Verify user exists and is active
    const existingUser = db.findById('users', user.id);
    if (!existingUser || existingUser.status === 'DISABLED') {
      return res.status(403).json({ message: 'Account is inactive or disabled' });
    }

    req.user = existingUser;
    next();
  });
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires one of roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET
};
