const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/websites - All websites linked to clients
router.get('/', authenticateToken, (req, res) => {
  const { search, type, clientId, scope } = req.query;
  let websites = db.get('websites');

  const isEmployee = req.user.role === 'EMPLOYEE';
  const filterToMy = scope === 'my' || (isEmployee && scope !== 'agency');

  if (filterToMy) {
    const myClients = db.find('clients', c => c.assignedEmployeeId === req.user.id || c.assignedEmployee === req.user.name);
    const myClientIds = new Set(myClients.map(c => c.id));
    websites = websites.filter(w => myClientIds.has(w.clientId));
  }

  if (clientId) {
    websites = websites.filter(w => w.clientId === clientId);
  }

  if (search) {
    const q = search.toLowerCase();
    websites = websites.filter(w =>
      (w.name && w.name.toLowerCase().includes(q)) ||
      (w.url && w.url.toLowerCase().includes(q)) ||
      (w.clientName && w.clientName.toLowerCase().includes(q))
    );
  }

  if (type) {
    websites = websites.filter(w => w.type && w.type.toLowerCase() === type.toLowerCase());
  }

  res.json(websites);
});

// GET /api/websites/:id - Single website
router.get('/:id', authenticateToken, (req, res) => {
  const website = db.findById('websites', req.params.id);
  if (!website) {
    return res.status(404).json({ message: 'Website not found' });
  }

  const audits = db.find('audits', a => a.websiteId === website.id || a.websiteUrl === website.url);
  audits.sort((a, b) => new Date(b.auditDate) - new Date(a.auditDate));

  res.json({
    website,
    audits
  });
});

// POST /api/websites - Add new website
router.post('/', authenticateToken, (req, res) => {
  const { clientId, url, name, type } = req.body;

  if (!clientId || !url) {
    return res.status(400).json({ message: 'Client ID and URL are required' });
  }

  const client = db.findById('clients', clientId);
  if (!client) {
    return res.status(404).json({ message: 'Selected client does not exist' });
  }

  let cleanUrl = url.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = 'https://' + cleanUrl;

  const newWebsite = db.insert('websites', {
    clientId: client.id,
    clientName: client.company,
    url: cleanUrl,
    name: name || `${client.company} Web`,
    type: type || 'Corporate',
    dateAdded: new Date().toISOString(),
    lastAuditDate: null,
    currentScore: null
  });

  res.status(201).json(newWebsite);
});

// PUT /api/websites/:id - Edit website
router.put('/:id', authenticateToken, (req, res) => {
  const updated = db.update('websites', req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ message: 'Website not found' });
  }
  res.json(updated);
});

// DELETE /api/websites/:id - Delete website
router.delete('/:id', authenticateToken, (req, res) => {
  const success = db.delete('websites', req.params.id);
  if (!success) {
    return res.status(404).json({ message: 'Website not found' });
  }
  res.json({ message: 'Website removed' });
});

module.exports = router;
