const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const { initDatabase } = require('./config/database');

// Ensure database is initialized
initDatabase();

// Seed default admin user
const { seedAdmin } = require('./services/authService');
seedAdmin();

const app = express();

// Middleware configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Root welcome & status endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'MaalyPlus Backend API',
    status: 'running',
    health: '/api/health',
    endpoints: {
      health: 'GET /api/health',
      leads: 'GET|POST /api/leads',
      leadByRef: 'GET /api/leads/:ref',
      financeRequest: 'POST /api/finance-request'
    }
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

module.exports = app;
