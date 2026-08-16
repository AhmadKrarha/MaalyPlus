const express = require('express');
const router = express.Router();

const healthRoutes = require('./health');
const leadsRoutes = require('./leads');
const authRoutes = require('./auth');
const { requireAuth, requireRole } = require('../middleware/auth');

// Public routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// The POST endpoint for finance-request stays public (frontend form submissions)
const { validateLead } = require('../validators/leadValidator');
const leadsController = require('../controllers/leadsController');
router.post('/finance-request', validateLead, leadsController.createLeadHandler);

// Protected routes — require admin login
router.use('/leads', requireAuth, requireRole('admin'), leadsRoutes);

module.exports = router;
