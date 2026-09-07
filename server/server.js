const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/database');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const clientRoutes = require('./routes/clients');
const websiteRoutes = require('./routes/websites');
const auditRoutes = require('./routes/audits');
const recommendationRoutes = require('./routes/recommendations');
const userRoutes = require('./routes/users');
const settingRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Static assets from client build if present
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Web-Based Website Audit & Optimization Recommendation System',
    agency: 'AeroDigital Growth Marketing',
    timestamp: new Date().toISOString()
  });
});

// Fallback to client index.html for SPA client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('AeroAudit Backend API Active. Client build not found in client/dist.');
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Website Audit & Optimization Backend running on port ${PORT}`);
  console.log(`🏢 Agency: AeroDigital Growth Marketing`);
  console.log(`=======================================================`);
});
