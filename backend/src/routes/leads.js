const express = require('express');
const router = express.Router();
const { validateLead } = require('../validators/leadValidator');
const leadsController = require('../controllers/leadsController');

/**
 * Lead ingestion and querying routes
 * Mounted at /api/leads and /api/finance-request
 */

// POST /api/leads - Create new lead
router.post('/', validateLead, leadsController.createLeadHandler);

// GET /api/leads - List leads with filters
router.get('/', leadsController.getLeadsHandler);

// GET /api/leads/:ref - Get lead by reference number
router.get('/:ref', leadsController.getLeadByRefHandler);

// PATCH /api/leads/:ref/status - Update lead status
router.patch('/:ref/status', leadsController.updateLeadStatusHandler);

module.exports = router;
