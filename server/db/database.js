const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

// Default initial state matching PRD
const getInitialData = () => {
  const salt = bcrypt.genSaltSync(10);
  const adminPassword = bcrypt.hashSync('admin123', salt);
  const employeePassword = bcrypt.hashSync('employee123', salt);

  const users = [
    {
      id: 'usr-admin-1',
      name: 'System Administrator',
      email: 'admin@agency.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: '2026-08-01T10:00:00Z'
    },
    {
      id: 'usr-emp-1',
      name: 'John Miller',
      email: 'employee@agency.com',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      createdAt: '2026-08-15T11:00:00Z'
    },
    {
      id: 'usr-emp-2',
      name: 'Sarah Connor',
      email: 'sarah@agency.com',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      createdAt: '2026-08-20T09:30:00Z'
    }
  ];

  const clients = [
    {
      id: 'client-1',
      name: 'Rajesh Kumar',
      company: 'ABC Furniture Pvt Ltd',
      email: 'contact@abcfurniture.com',
      phone: '+91 98765 43210',
      industry: 'E-Commerce & Retail',
      website: 'https://abcfurniture.com',
      assignedEmployee: 'John Miller',
      assignedEmployeeId: 'usr-emp-1',
      dateAdded: '2026-01-10T08:00:00Z',
      createdAt: '2026-01-10T08:00:00Z'
    },
    {
      id: 'client-2',
      name: 'Pooja Sharma',
      company: 'XYZ Tech Solutions',
      email: 'info@xyz.in',
      phone: '+91 98111 22334',
      industry: 'Information Technology',
      website: 'https://xyz.in',
      assignedEmployee: 'Sarah Connor',
      assignedEmployeeId: 'usr-emp-2',
      dateAdded: '2026-03-12T14:00:00Z',
      createdAt: '2026-03-12T14:00:00Z'
    },
    {
      id: 'client-3',
      name: 'Dr. Anil Verma',
      company: 'PQR Healthcare Ltd',
      email: 'support@pqr.com',
      phone: '+91 99887 76655',
      industry: 'Healthcare & Medical',
      website: 'https://pqr.com',
      assignedEmployee: 'John Miller',
      assignedEmployeeId: 'usr-emp-1',
      dateAdded: '2026-04-05T10:30:00Z',
      createdAt: '2026-04-05T10:30:00Z'
    }
  ];

  const websites = [
    {
      id: 'web-1',
      clientId: 'client-1',
      clientName: 'ABC Furniture Pvt Ltd',
      url: 'https://abcfurniture.com',
      name: 'ABC Furniture E-Commerce Store',
      type: 'E-Commerce',
      dateAdded: '2026-01-10T08:00:00Z',
      lastAuditDate: '2026-09-06T12:00:00Z',
      currentScore: 86
    },
    {
      id: 'web-2',
      clientId: 'client-2',
      clientName: 'XYZ Tech Solutions',
      url: 'https://xyz.in',
      name: 'XYZ Tech Corporate Portal',
      type: 'Corporate',
      dateAdded: '2026-03-12T14:00:00Z',
      lastAuditDate: '2026-09-05T11:00:00Z',
      currentScore: 64
    },
    {
      id: 'web-3',
      clientId: 'client-3',
      clientName: 'PQR Healthcare Ltd',
      url: 'https://pqr.com',
      name: 'PQR Medical Hub',
      type: 'Healthcare',
      dateAdded: '2026-04-05T10:30:00Z',
      lastAuditDate: '2026-09-04T15:00:00Z',
      currentScore: 91
    }
  ];

  // Seed Audits reflecting PRD Page 8, 12: ABC Furniture Initial (72) and Follow-up (86)
  const audits = [
    {
      id: 'audit-abc-init',
      websiteId: 'web-1',
      clientId: 'client-1',
      clientName: 'ABC Furniture Pvt Ltd',
      websiteUrl: 'https://abcfurniture.com',
      auditDate: '2026-04-10T11:30:00Z',
      month: 'April',
      overallScore: 72,
      categoryScores: {
        onPageSEO: 81,
        technicalSEO: 69,
        performance: 64,
        mobile: 89,
        content: 75
      },
      counts: {
        critical: 3,
        warnings: 7,
        info: 4,
        passed: 31
      },
      conductedBy: 'John Miller',
      metrics: {
        responseTimeMs: 2450,
        pageSizeMB: 3.4,
        h1Count: 2,
        imagesTotal: 28,
        imagesWithoutAlt: 7,
        sslValid: true,
        robotsValid: true,
        sitemapValid: false,
        canonicalTag: true,
        viewportTag: true,
        responsiveCss: true,
        wordCount: 850
      },
      notes: 'Initial evaluation for ABC Furniture Pvt Ltd prior to Q2 digital marketing campaigns.'
    },
    {
      id: 'audit-abc-followup',
      websiteId: 'web-1',
      clientId: 'client-1',
      clientName: 'ABC Furniture Pvt Ltd',
      websiteUrl: 'https://abcfurniture.com',
      auditDate: '2026-09-06T12:00:00Z',
      month: 'June',
      overallScore: 86,
      previousScore: 72,
      improvementDelta: 14,
      categoryScores: {
        onPageSEO: 88,
        technicalSEO: 85,
        performance: 82,
        mobile: 92,
        content: 84
      },
      counts: {
        critical: 1,
        warnings: 3,
        info: 2,
        passed: 39
      },
      conductedBy: 'John Miller',
      metrics: {
        responseTimeMs: 1250,
        pageSizeMB: 1.8,
        h1Count: 1,
        imagesTotal: 28,
        imagesWithoutAlt: 1,
        sslValid: true,
        robotsValid: true,
        sitemapValid: true,
        canonicalTag: true,
        viewportTag: true,
        responsiveCss: true,
        wordCount: 1240
      },
      notes: 'Follow-up audit after image compression, sitemap submission, and meta tag optimization.'
    },
    {
      id: 'audit-xyz-1',
      websiteId: 'web-2',
      clientId: 'client-2',
      clientName: 'XYZ Tech Solutions',
      websiteUrl: 'https://xyz.in',
      auditDate: '2026-09-05T11:00:00Z',
      month: 'September',
      overallScore: 64,
      categoryScores: {
        onPageSEO: 68,
        technicalSEO: 58,
        performance: 55,
        mobile: 80,
        content: 65
      },
      counts: {
        critical: 5,
        warnings: 9,
        info: 3,
        passed: 24
      },
      conductedBy: 'Sarah Connor',
      metrics: {
        responseTimeMs: 3800,
        pageSizeMB: 4.8,
        h1Count: 0,
        imagesTotal: 34,
        imagesWithoutAlt: 15,
        sslValid: true,
        robotsValid: false,
        sitemapValid: false,
        canonicalTag: false,
        viewportTag: true,
        responsiveCss: true,
        wordCount: 420
      },
      notes: 'Website needs substantial technical overhaul, broken link fixes, and performance caching.'
    },
    {
      id: 'audit-pqr-1',
      websiteId: 'web-3',
      clientId: 'client-3',
      clientName: 'PQR Healthcare Ltd',
      websiteUrl: 'https://pqr.com',
      auditDate: '2026-09-04T15:00:00Z',
      month: 'September',
      overallScore: 91,
      categoryScores: {
        onPageSEO: 94,
        technicalSEO: 92,
        performance: 88,
        mobile: 95,
        content: 86
      },
      counts: {
        critical: 0,
        warnings: 2,
        info: 3,
        passed: 43
      },
      conductedBy: 'John Miller',
      metrics: {
        responseTimeMs: 820,
        pageSizeMB: 1.1,
        h1Count: 1,
        imagesTotal: 19,
        imagesWithoutAlt: 0,
        sslValid: true,
        robotsValid: true,
        sitemapValid: true,
        canonicalTag: true,
        viewportTag: true,
        responsiveCss: true,
        wordCount: 1650
      },
      notes: 'Excellent medical portal architecture. Minor image caching recommendations.'
    }
  ];

  // Historical score progression for ABC Furniture matching PRD FR-15
  const auditHistory = [
    { month: 'January', score: 61, date: '2026-01-15' },
    { month: 'February', score: 65, date: '2026-02-15' },
    { month: 'March', score: 69, date: '2026-03-15' },
    { month: 'April', score: 72, date: '2026-04-10' },
    { month: 'May', score: 78, date: '2026-05-18' },
    { month: 'June', score: 82, date: '2026-06-22' },
    { month: 'September', score: 86, date: '2026-09-06' }
  ];

  const auditIssues = [
    {
      id: 'iss-1',
      auditId: 'audit-abc-followup',
      clientId: 'client-1',
      websiteUrl: 'https://abcfurniture.com',
      category: 'Technical SEO',
      severity: 'CRITICAL',
      title: 'Missing canonical tag on promotional landing subpages',
      description: 'Certain subpages risk duplicate content penalties without self-referential canonical tags.',
      status: 'OPEN',
      passed: false
    },
    {
      id: 'iss-2',
      auditId: 'audit-abc-followup',
      clientId: 'client-1',
      websiteUrl: 'https://abcfurniture.com',
      category: 'On-Page SEO',
      severity: 'WARNING',
      title: '1 image missing ALT attribute',
      description: 'Found 1 catalog banner image missing alternative text.',
      status: 'OPEN',
      passed: false
    },
    {
      id: 'iss-3',
      auditId: 'audit-abc-followup',
      clientId: 'client-1',
      websiteUrl: 'https://abcfurniture.com',
      category: 'Performance',
      severity: 'WARNING',
      title: 'Server response time could be faster (1.25s)',
      description: 'Response time is acceptable but could achieve sub-second TTFB with edge CDN caching.',
      status: 'OPEN',
      passed: false
    },
    {
      id: 'iss-4',
      auditId: 'audit-xyz-1',
      clientId: 'client-2',
      websiteUrl: 'https://xyz.in',
      category: 'On-Page SEO',
      severity: 'CRITICAL',
      title: 'Missing H1 heading on homepage',
      description: 'Primary landing page lacks an H1 tag to establish main page topic.',
      status: 'OPEN',
      passed: false
    },
    {
      id: 'iss-5',
      auditId: 'audit-xyz-1',
      clientId: 'client-2',
      websiteUrl: 'https://xyz.in',
      category: 'Technical SEO',
      severity: 'CRITICAL',
      title: 'robots.txt not found (404 status)',
      description: 'Search engine bots cannot parse indexing directives or find sitemap location.',
      status: 'OPEN',
      passed: false
    },
    {
      id: 'iss-6',
      auditId: 'audit-xyz-1',
      clientId: 'client-2',
      websiteUrl: 'https://xyz.in',
      category: 'On-Page SEO',
      severity: 'WARNING',
      title: '15 images without descriptive ALT attributes',
      description: 'Search engines and screen readers cannot understand image contexts.',
      status: 'OPEN',
      passed: false
    }
  ];

  const recommendations = [
    {
      id: 'rec-1',
      issueId: 'iss-1',
      auditId: 'audit-abc-followup',
      clientId: 'client-1',
      clientName: 'ABC Furniture Pvt Ltd',
      websiteUrl: 'https://abcfurniture.com',
      category: 'Technical SEO',
      severity: 'CRITICAL',
      title: 'Implement canonical tags across product variations',
      recommendationText: 'Add <link rel="canonical" href="[preferred_url]" /> in the <head> of all pages to prevent duplicate content flags.',
      actionStep: 'Add canonical tag to page template',
      status: 'OPEN',
      createdAt: '2026-09-06T12:05:00Z'
    },
    {
      id: 'rec-2',
      issueId: 'iss-2',
      auditId: 'audit-abc-followup',
      clientId: 'client-1',
      clientName: 'ABC Furniture Pvt Ltd',
      websiteUrl: 'https://abcfurniture.com',
      category: 'On-Page SEO',
      severity: 'WARNING',
      title: 'Add descriptive ALT text to banner image',
      recommendationText: 'Provide descriptive, keyword-rich alternative text to help search engines understand the image and improve accessibility.',
      actionStep: 'Update <img> tag with alt="Teak Wood Dining Table with Chairs"',
      status: 'OPEN',
      createdAt: '2026-09-06T12:05:00Z'
    },
    {
      id: 'rec-3',
      issueId: 'iss-3',
      auditId: 'audit-abc-followup',
      clientId: 'client-1',
      clientName: 'ABC Furniture Pvt Ltd',
      websiteUrl: 'https://abcfurniture.com',
      category: 'Performance',
      severity: 'INFO',
      title: 'Enable Cloudflare or Edge caching for static assets',
      recommendationText: 'Leverage CDN caching and browser caching headers (Cache-Control: max-age=31536000) to decrease TTFB below 800ms.',
      actionStep: 'Configure CDN caching rules',
      status: 'OPEN',
      createdAt: '2026-09-06T12:05:00Z'
    },
    {
      id: 'rec-4',
      issueId: 'iss-4',
      auditId: 'audit-xyz-1',
      clientId: 'client-2',
      clientName: 'XYZ Tech Solutions',
      websiteUrl: 'https://xyz.in',
      category: 'On-Page SEO',
      severity: 'CRITICAL',
      title: 'Create an H1 headline describing IT services',
      recommendationText: 'Ensure exactly one prominent H1 tag exists at the top of the body reflecting primary target keywords.',
      actionStep: 'Wrap primary title in <h1> tag',
      status: 'OPEN',
      createdAt: '2026-09-05T11:05:00Z'
    },
    {
      id: 'rec-5',
      issueId: 'iss-5',
      auditId: 'audit-xyz-1',
      clientId: 'client-2',
      clientName: 'XYZ Tech Solutions',
      websiteUrl: 'https://xyz.in',
      category: 'Technical SEO',
      severity: 'CRITICAL',
      title: 'Generate and upload robots.txt and sitemap.xml',
      recommendationText: 'Deploy a valid robots.txt file with User-agent: * and specify Sitemap: https://xyz.in/sitemap.xml.',
      actionStep: 'Upload robots.txt to domain root',
      status: 'OPEN',
      createdAt: '2026-09-05T11:05:00Z'
    }
  ];

  const settings = {
    agencyName: 'AeroDigital Growth Marketing',
    organization: 'Enterprise Digital Marketing Division',
    academicYear: '2026',
    contactEmail: 'audits@aerodigital.agency',
    contactPhone: '+91 11 2757 1234',
    // Configurable weights per PRD Section 7 (FR-11)
    weights: {
      onPageSEO: 30,
      technicalSEO: 30,
      performance: 20,
      mobile: 10,
      content: 10
    }
  };

  return {
    users,
    clients,
    websites,
    audits,
    auditHistory,
    auditIssues,
    recommendations,
    settings
  };
};

class JsonDB {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      this.data = initialData;
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading db.json, re-initializing...', err);
        this.data = getInitialData();
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
      }
    }
  }

  save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
  }

  get(collection) {
    return this.data[collection] || [];
  }

  find(collection, filterFn = () => true) {
    return (this.data[collection] || []).filter(filterFn);
  }

  findOne(collection, filterFn) {
    return (this.data[collection] || []).find(filterFn);
  }

  findById(collection, id) {
    return (this.data[collection] || []).find(item => item.id === id || item._id === id);
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    const newItem = {
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: item.createdAt || new Date().toISOString(),
      ...item
    };
    this.data[collection].unshift(newItem);
    this.save();
    return newItem;
  }

  update(collection, id, updates) {
    if (!this.data[collection]) return null;
    const index = this.data[collection].findIndex(item => item.id === id || item._id === id);
    if (index === -1) return null;
    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data[collection][index];
  }

  delete(collection, id) {
    if (!this.data[collection]) return false;
    const index = this.data[collection].findIndex(item => item.id === id || item._id === id);
    if (index === -1) return false;
    this.data[collection].splice(index, 1);
    this.save();
    return true;
  }
}

const db = new JsonDB();

module.exports = db;
