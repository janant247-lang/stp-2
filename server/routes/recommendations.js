const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/recommendations - Consolidated list of open recommendations
router.get('/', authenticateToken, (req, res) => {
  const { category, severity, status, clientId, search, scope } = req.query;
  let recommendations = db.get('recommendations');

  const isEmployee = req.user.role === 'EMPLOYEE';
  const filterToMy = scope === 'my' || (isEmployee && scope !== 'agency');

  if (filterToMy) {
    const myClients = db.find('clients', c => c.assignedEmployeeId === req.user.id || c.assignedEmployee === req.user.name);
    const myClientIds = new Set(myClients.map(c => c.id));
    recommendations = recommendations.filter(r => myClientIds.has(r.clientId));
  }

  if (category) {
    recommendations = recommendations.filter(r => r.category && r.category.toLowerCase() === category.toLowerCase());
  }

  if (severity) {
    recommendations = recommendations.filter(r => r.severity && r.severity.toLowerCase() === severity.toLowerCase());
  }

  if (status) {
    recommendations = recommendations.filter(r => r.status && r.status.toLowerCase() === status.toLowerCase());
  }

  if (clientId) {
    recommendations = recommendations.filter(r => r.clientId === clientId);
  }

  if (search) {
    const q = search.toLowerCase();
    recommendations = recommendations.filter(r =>
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.recommendationText && r.recommendationText.toLowerCase().includes(q)) ||
      (r.clientName && r.clientName.toLowerCase().includes(q)) ||
      (r.websiteUrl && r.websiteUrl.toLowerCase().includes(q))
    );
  }

  res.json(recommendations);
});

// PATCH /api/recommendations/:id - Update status (e.g., OPEN to RESOLVED)
router.patch('/:id', authenticateToken, (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const updated = db.update('recommendations', req.params.id, { status });
  if (!updated) {
    return res.status(404).json({ message: 'Recommendation not found' });
  }

  // Also update corresponding issue if exists
  if (updated.issueId) {
    db.update('auditIssues', updated.issueId, { status });
  }

  res.json(updated);
});

module.exports = router;
