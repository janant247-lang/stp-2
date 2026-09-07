const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/settings - Public authenticated read
router.get('/', authenticateToken, (req, res) => {
  res.json(db.data.settings);
});

// PUT /api/settings - Update weights and agency settings (Admin only)
router.put('/', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const { agencyName, institution, contactEmail, contactPhone, weights } = req.body;

  if (weights) {
    const { onPageSEO, technicalSEO, performance, mobile, content } = weights;
    const total = (Number(onPageSEO) || 0) + (Number(technicalSEO) || 0) + (Number(performance) || 0) + (Number(mobile) || 0) + (Number(content) || 0);
    if (total !== 100) {
      return res.status(400).json({
        message: `Category weights must sum to exactly 100%. Current sum: ${total}%`
      });
    }
  }

  db.data.settings = {
    ...db.data.settings,
    ...(agencyName && { agencyName }),
    ...(institution && { institution }),
    ...(contactEmail && { contactEmail }),
    ...(contactPhone && { contactPhone }),
    ...(weights && {
      weights: {
        onPageSEO: Number(weights.onPageSEO),
        technicalSEO: Number(weights.technicalSEO),
        performance: Number(weights.performance),
        mobile: Number(weights.mobile),
        content: Number(weights.content)
      }
    })
  };

  db.save();
  res.json({
    message: 'Settings updated successfully',
    settings: db.data.settings
  });
});

module.exports = router;
