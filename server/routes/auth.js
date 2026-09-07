const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.status === 'DISABLED') {
    return res.status(403).json({ message: 'Your account has been disabled by an administrator' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash, ...safeUser } = user;

  res.json({
    token,
    user: safeUser
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const { passwordHash, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long' });
  }

  const user = db.findById('users', req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User account not found' });
  }

  const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ message: 'Incorrect current password' });
  }

  const salt = bcrypt.genSaltSync(10);
  const newPasswordHash = bcrypt.hashSync(newPassword, salt);

  db.update('users', user.id, { passwordHash: newPasswordHash });

  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
