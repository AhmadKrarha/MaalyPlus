const leadService = require('../services/leadService');

/**
 * Controller to handle POST /api/leads (or /api/finance-request)
 */
async function createLeadHandler(req, res, next) {
  try {
    const leadData = req.validatedData || req.body;
    const metadata = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || ''
    };

    const lead = leadService.createLead(leadData, metadata);

    return res.status(201).json({
      success: true,
      message: 'Lead received and registered successfully',
      data: {
        id: lead.id,
        ref: lead.ref,
        applicant_type: lead.applicant_type,
        status: lead.status,
        created_at: lead.created_at
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to handle GET /api/leads/:ref
 */
async function getLeadByRefHandler(req, res, next) {
  try {
    const { ref } = req.params;
    if (!ref) {
      return res.status(400).json({
        success: false,
        error: 'Reference parameter is required'
      });
    }

    const lead = leadService.getLeadByRef(ref);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: `Lead not found for reference ${ref}`
      });
    }

    return res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Helper to safely extract a scalar string from query parameter (takes first element if array)
 */
function sanitizeQueryParam(val) {
  if (Array.isArray(val)) {
    return val.length > 0 ? String(val[0]) : undefined;
  }
  if (typeof val === 'string') {
    return val;
  }
  return undefined;
}

/**
 * Controller to handle GET /api/leads
 */
async function getLeadsHandler(req, res, next) {
  try {
    const rawStatus = req.query.status;
    const rawType = req.query.applicant_type !== undefined ? req.query.applicant_type : req.query.type;
    const rawLimit = req.query.limit;
    const rawOffset = req.query.offset;

    const status = sanitizeQueryParam(rawStatus);
    const applicant_type = sanitizeQueryParam(rawType);
    const limit = sanitizeQueryParam(rawLimit);
    const offset = sanitizeQueryParam(rawOffset);

    const result = leadService.getLeads({
      status,
      applicant_type,
      limit,
      offset
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to handle PATCH /api/leads/:ref/status
 */
async function updateLeadStatusHandler(req, res, next) {
  try {
    const { ref } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'under_review', 'matched', 'contacted', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = leadService.updateLeadStatus(ref, status);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Lead not found for reference ${ref}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead status updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createLeadHandler,
  getLeadByRefHandler,
  getLeadsHandler,
  updateLeadStatusHandler
};
