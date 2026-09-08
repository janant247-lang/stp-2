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

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please enter your registered email address' });
  }

  const user = db.findOne('users', u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return res.status(404).json({ message: 'No account found associated with this email address' });
  }

  if (user.status === 'DISABLED') {
    return res.status(403).json({ message: 'Your account is disabled. Please contact your administrator.' });
  }

  // Generate 6-digit verification code & 15-minute expiry
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const resetExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  db.update('users', user.id, {
    resetCode,
    resetExpires
  });

  res.json({
    message: 'A 6-digit password reset code has been sent to your email address.',
    email: user.email,
    resetCode // Returned for seamless testing in demo/development environments
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, 6-digit reset code, and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long' });
  }

  const user = db.findOne('users', u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return res.status(404).json({ message: 'User account not found' });
  }

  if (!user.resetCode || user.resetCode !== code.toString().trim()) {
    return res.status(400).json({ message: 'Invalid reset code. Please check and try again.' });
  }

  if (!user.resetExpires || new Date() > new Date(user.resetExpires)) {
    return res.status(400).json({ message: 'This reset code has expired. Please request a new one.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const newPasswordHash = bcrypt.hashSync(newPassword, salt);

  db.update('users', user.id, {
    passwordHash: newPasswordHash,
    resetCode: null,
    resetExpires: null
  });

  res.json({ message: 'Password has been reset successfully! You can now log in.' });
});

module.exports = router;

