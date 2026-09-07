const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All user management routes require ADMIN role
router.use(authenticateToken, requireRole('ADMIN'));

// GET /api/users - List all users
router.get('/', (req, res) => {
  const users = db.get('users').map(({ passwordHash, ...user }) => {
    // Count assigned clients
    const clientsCount = db.find('clients', c => c.assignedEmployeeId === user.id || c.assignedEmployee === user.name).length;
    return {
      ...user,
      clientsCount
    };
  });
  res.json(users);
});

// POST /api/users - Add employee account
router.post('/', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const existing = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ message: 'A user with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = db.insert('users', {
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: role || 'EMPLOYEE',
    status: 'ACTIVE',
    dateAdded: new Date().toISOString()
  });

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

// PATCH /api/users/:id/status - Enable/disable employee account
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status || !['ACTIVE', 'DISABLED'].includes(status)) {
    return res.status(400).json({ message: 'Valid status is ACTIVE or DISABLED' });
  }

  // Prevent disabling own admin account
  if (req.params.id === req.user.id && status === 'DISABLED') {
    return res.status(400).json({ message: 'You cannot disable your own administrator account' });
  }

  const updated = db.update('users', req.params.id, { status });
  if (!updated) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { passwordHash: _, ...safeUser } = updated;
  res.json(safeUser);
});

// PATCH /api/users/:id/role - Change role
router.patch('/:id/role', (req, res) => {
  const { role } = req.body;
  if (!role || !['ADMIN', 'EMPLOYEE'].includes(role)) {
    return res.status(400).json({ message: 'Valid role is ADMIN or EMPLOYEE' });
  }

  const updated = db.update('users', req.params.id, { role });
  if (!updated) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { passwordHash: _, ...safeUser } = updated;
  res.json(safeUser);
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  const success = db.delete('users', req.params.id);
  if (!success) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ message: 'User deleted' });
});

module.exports = router;
