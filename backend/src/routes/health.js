const express = require('express');
const router = express.Router();
const { isHealthy } = require('../config/database');

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', (req, res) => {
  const dbStatus = isHealthy();
  const statusCode = dbStatus ? 200 : 503;

  return res.status(statusCode).json({
    status: dbStatus ? 'ok' : 'error',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
