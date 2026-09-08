const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/clients - List, search, and filter
router.get('/', authenticateToken, (req, res) => {
  const { search, industry, employee, scope } = req.query;
  let clients = db.get('clients');

  const isEmployee = req.user.role === 'EMPLOYEE';
  const filterToMy = scope === 'my' || (isEmployee && scope !== 'agency');

  if (filterToMy) {
    clients = clients.filter(c => c.assignedEmployeeId === req.user.id || c.assignedEmployee === req.user.name);
  } else if (employee) {
    clients = clients.filter(c => c.assignedEmployee && c.assignedEmployee.toLowerCase().includes(employee.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    clients = clients.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.website && c.website.toLowerCase().includes(q))
    );
  }

  if (industry) {
    clients = clients.filter(c => c.industry && c.industry.toLowerCase().includes(industry.toLowerCase()));
  }

  // Attach basic website count and average score to each client
  const websites = db.get('websites');
  const enrichedClients = clients.map(client => {
    const clientWebsites = websites.filter(w => w.clientId === client.id);
    const scores = clientWebsites.map(w => w.currentScore).filter(s => typeof s === 'number');
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    return {
      ...client,
      websitesCount: clientWebsites.length,
      currentScore: avgScore
    };
  });

  res.json(enrichedClients);
});

// GET /api/clients/:id - Single client overview with FR-16 metrics
router.get('/:id', authenticateToken, (req, res) => {
  const client = db.findById('clients', req.params.id);
  if (!client) {
    return res.status(404).json({ message: 'Client not found' });
  }

  const clientWebsites = db.find('websites', w => w.clientId === client.id);
  const clientAudits = db.find('audits', a => a.clientId === client.id);
  const clientIssues = db.find('auditIssues', i => i.clientId === client.id && i.status === 'OPEN');

  // Sort audits newest first
  clientAudits.sort((a, b) => new Date(b.auditDate) - new Date(a.auditDate));

  const latestAudit = clientAudits[0] || null;
  const previousAudit = clientAudits[1] || null;

  const currentScore = latestAudit ? latestAudit.overallScore : (clientWebsites[0]?.currentScore || null);
  const previousScore = previousAudit ? previousAudit.overallScore : (latestAudit?.previousScore || null);
  const improvementDelta = (currentScore !== null && previousScore !== null) ? (currentScore - previousScore) : 0;

  // History timeline for charts
  let progression = [];
  if (client.company.includes('ABC Furniture')) {
    progression = db.get('auditHistory');
  } else {
    progression = clientAudits.slice().reverse().map(a => ({
      month: a.month || new Date(a.auditDate).toLocaleString('default', { month: 'short' }),
      score: a.overallScore,
      date: a.auditDate
    }));
  }

  res.json({
    client,
    stats: {
      currentScore,
      previousScore,
      improvementDelta,
      totalAuditsConducted: clientAudits.length,
      openIssuesCount: clientIssues.length,
      websitesCount: clientWebsites.length
    },
    websites: clientWebsites,
    recentAudits: clientAudits.slice(0, 5),
    openIssues: clientIssues,
    progression
  });
});

// POST /api/clients - Create client (Admin Only: FR-03 & Permission Rule)
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Access denied. Only administrators can register new clients and assign them to employees.'
    });
  }

  const { name, company, email, phone, industry, website, assignedEmployee, assignedEmployeeId } = req.body;

  if (!name || !company || !email) {
    return res.status(400).json({ message: 'Name, company name, and email are required' });
  }

  // Resolve assigned employee
  let targetEmpName = 'Unassigned';
  let targetEmpId = null;

  if (assignedEmployeeId) {
    const empUser = db.findById('users', assignedEmployeeId);
    if (empUser) {
      targetEmpName = empUser.name;
      targetEmpId = empUser.id;
    }
  } else if (assignedEmployee) {
    const empUser = db.findOne('users', u => u.name.toLowerCase() === assignedEmployee.trim().toLowerCase());
    if (empUser) {
      targetEmpName = empUser.name;
      targetEmpId = empUser.id;
    } else {
      targetEmpName = assignedEmployee;
    }
  }

  const newClient = db.insert('clients', {
    name,
    company,
    email,
    phone: phone || '',
    industry: industry || 'General Business',
    website: website || '',
    assignedEmployee: targetEmpName,
    assignedEmployeeId: targetEmpId,
    dateAdded: new Date().toISOString()
  });

  // If website provided, auto-create associated website entry
  if (website) {
    let cleanUrl = website.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = 'https://' + cleanUrl;
    db.insert('websites', {
      clientId: newClient.id,
      clientName: newClient.company,
      url: cleanUrl,
      name: `${newClient.company} Official Site`,
      type: industry ? industry.split('/')[0].trim() : 'Corporate',
      currentScore: null,
      lastAuditDate: null,
      dateAdded: new Date().toISOString()
    });
  }

  res.status(201).json(newClient);
});

// PUT /api/clients/:id - Edit client (Only Admin can reassign)
router.put('/:id', authenticateToken, (req, res) => {
  const isChangingAssignment =
    req.body.assignedEmployee !== undefined || req.body.assignedEmployeeId !== undefined;

  if (isChangingAssignment && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Access denied. Only administrators can assign or reassign clients to employees.'
    });
  }

  const updates = { ...req.body };

  // Sync employee name and id if admin provides either
  if (req.user.role === 'ADMIN') {
    if (updates.assignedEmployeeId) {
      const empUser = db.findById('users', updates.assignedEmployeeId);
      if (empUser) {
        updates.assignedEmployee = empUser.name;
        updates.assignedEmployeeId = empUser.id;
      }
    } else if (updates.assignedEmployee) {
      const empUser = db.findOne('users', u => u.name.toLowerCase() === updates.assignedEmployee.trim().toLowerCase());
      if (empUser) {
        updates.assignedEmployee = empUser.name;
        updates.assignedEmployeeId = empUser.id;
      }
    }
  }

  const updated = db.update('clients', req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ message: 'Client not found' });
  }
  res.json(updated);
});

// DELETE /api/clients/:id - Delete client (Admin Only)
router.delete('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Access denied. Only administrators can remove clients from the system.'
    });
  }

  const success = db.delete('clients', req.params.id);
  if (!success) {
    return res.status(404).json({ message: 'Client not found' });
  }
  res.json({ message: 'Client deleted successfully' });
});

module.exports = router;
