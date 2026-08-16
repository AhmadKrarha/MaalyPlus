const { getDatabase } = require('../config/database');

/**
 * Generates a unique reference number formatted as MP-YYMM-XXXX.
 * @param {object} [db] Optional database instance
 * @returns {string} Unique reference number
 */
function generateReferenceNumber(db = getDatabase()) {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');

  let ref;
  let attempts = 0;
  const maxAttempts = 20;

  do {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit number 1000-9999
    ref = `MP-${yy}${mm}-${randomSuffix}`;
    
    // Check if ref already exists
    const existing = db.prepare('SELECT id FROM leads WHERE ref = ?').get(ref);
    if (!existing) {
      return ref;
    }
    attempts++;
  } while (attempts < maxAttempts);

  // Fallback with timestamp millisecond suffix if many attempts
  return `MP-${yy}${mm}-${Date.now().toString().slice(-4)}`;
}

/**
 * Creates and persists a new lead into the SQLite database.
 * @param {object} leadData Validated lead data
 * @param {object} [metadata] Extra request metadata (ip, userAgent, rawPayload)
 * @returns {object} Created lead record
 */
function createLead(leadData, metadata = {}) {
  const db = getDatabase();

  // Validate or generate reference number
  let ref = leadData.ref;
  if (!ref || !/^MP-\d{4}-\d{4}$/.test(ref)) {
    ref = generateReferenceNumber(db);
  } else {
    // If ref provided, check for uniqueness
    const existing = db.prepare('SELECT id FROM leads WHERE ref = ?').get(ref);
    if (existing) {
      ref = generateReferenceNumber(db);
    }
  }

  const nowIso = new Date().toISOString();
  const applicantType = leadData.applicant_type;
  const isIndividual = applicantType === 'فرد' || applicantType === 'individual';

  // Build biz_docs array
  let bizDocs = [];
  if (!isIndividual) {
    if (leadData.doc_cr) bizDocs.push('doc_cr');
    if (leadData.doc_license) bizDocs.push('doc_license');
    if (leadData.doc_financials) bizDocs.push('doc_financials');
    if (leadData.doc_bank) bizDocs.push('doc_bank');
    if (leadData.doc_tax) bizDocs.push('doc_tax');
    if (leadData.doc_collateral) bizDocs.push('doc_collateral');
  }

  const insertStmt = db.prepare(`
    INSERT INTO leads (
      ref,
      applicant_type,
      status,
      full_name,
      phone,
      email,
      governorate,
      contact_role,
      notes,
      consent,
      ind_product,
      ind_amount,
      ind_tenor,
      ind_sharia,
      ind_income,
      ind_obligations,
      ind_employment,
      ind_job_years,
      ind_transfer,
      biz_name,
      biz_legal,
      biz_sector,
      biz_age,
      biz_employees,
      biz_revenue,
      biz_purpose,
      biz_amount,
      biz_tenor,
      biz_docs_json,
      biz_sharia,
      doc_cr,
      doc_license,
      doc_financials,
      doc_bank,
      doc_tax,
      doc_collateral,
      est_rate_used,
      ip_address,
      user_agent,
      payload_json,
      created_at,
      updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?
    )
  `);

  const rawPayloadJson = JSON.stringify(leadData);

  const result = insertStmt.run(
    ref,
    isIndividual ? 'فرد' : 'منشأة',
    'pending',
    leadData.full_name,
    leadData.phone,
    leadData.email,
    leadData.governorate,
    leadData.contact_role || null,
    leadData.notes || '',
    1,
    isIndividual ? (leadData.ind_product || null) : null,
    isIndividual ? (Number(leadData.ind_amount) || null) : null,
    isIndividual ? (Number(leadData.ind_tenor) || null) : null,
    isIndividual ? (leadData.ind_sharia || 'لا يهمّني') : null,
    isIndividual ? (Number(leadData.ind_income) || 0) : null,
    isIndividual ? (Number(leadData.ind_obligations) || 0) : null,
    isIndividual ? (leadData.ind_employment || null) : null,
    isIndividual ? (leadData.ind_job_years || null) : null,
    isIndividual ? (leadData.ind_transfer || null) : null,
    !isIndividual ? (leadData.biz_name || null) : null,
    !isIndividual ? (leadData.biz_legal || null) : null,
    !isIndividual ? (leadData.biz_sector || null) : null,
    !isIndividual ? (leadData.biz_age || null) : null,
    !isIndividual ? (leadData.biz_employees || null) : null,
    !isIndividual ? (leadData.biz_revenue || null) : null,
    !isIndividual ? (leadData.biz_purpose || null) : null,
    !isIndividual ? (Number(leadData.biz_amount) || null) : null,
    !isIndividual ? (Number(leadData.biz_tenor) || null) : null,
    !isIndividual ? JSON.stringify(bizDocs) : null,
    !isIndividual ? (leadData.biz_sharia || 'لا يهمّني') : null,
    !isIndividual ? (leadData.doc_cr ? 1 : 0) : 0,
    !isIndividual ? (leadData.doc_license ? 1 : 0) : 0,
    !isIndividual ? (leadData.doc_financials ? 1 : 0) : 0,
    !isIndividual ? (leadData.doc_bank ? 1 : 0) : 0,
    !isIndividual ? (leadData.doc_tax ? 1 : 0) : 0,
    !isIndividual ? (leadData.doc_collateral ? 1 : 0) : 0,
    leadData.est_rate_used !== undefined ? Number(leadData.est_rate_used) : 7.75,
    metadata.ip || null,
    metadata.userAgent || null,
    rawPayloadJson,
    nowIso,
    nowIso
  );

  const insertedId = result.lastInsertRowid;
  const createdRecord = db.prepare('SELECT * FROM leads WHERE ref = ?').get(ref);

  return createdRecord;
}

/**
 * Retrieves a lead by reference number.
 * @param {string} ref
 * @returns {object|null}
 */
function getLeadByRef(ref) {
  const db = getDatabase();
  const lead = db.prepare('SELECT * FROM leads WHERE ref = ?').get(ref);
  if (!lead) return null;

  return formatLeadRecord(lead);
}

/**
 * Retrieves a list of leads with optional filtering and pagination.
 * @param {object} options
 * @returns {object} { total, count, data }
 */
function getLeads(options = {}) {
  const db = getDatabase();
  let { status, applicant_type, limit = 50, offset = 0 } = options;

  if (Array.isArray(status)) status = status[0];
  if (Array.isArray(applicant_type)) applicant_type = applicant_type[0];
  if (Array.isArray(limit)) limit = limit[0];
  if (Array.isArray(offset)) offset = offset[0];

  let whereClauses = [];
  let params = [];

  if (status) {
    whereClauses.push('status = ?');
    params.push(String(status));
  }

  if (applicant_type) {
    whereClauses.push('applicant_type = ?');
    params.push(String(applicant_type));
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRow = db.prepare(`SELECT COUNT(*) as total FROM leads ${whereSql}`).get(...params);
  const total = countRow ? (typeof countRow.total === 'bigint' ? Number(countRow.total) : countRow.total) : 0;

  const queryParams = [...params, Number(limit) || 50, Number(offset) || 0];
  const rows = db.prepare(`
    SELECT * FROM leads 
    ${whereSql} 
    ORDER BY id DESC 
    LIMIT ? OFFSET ?
  `).all(...queryParams);

  const formattedRows = rows.map(formatLeadRecord);

  return {
    total,
    count: formattedRows.length,
    data: formattedRows
  };
}

/**
 * Updates lead status.
 * @param {string} ref
 * @param {string} newStatus
 * @returns {object|null}
 */
function updateLeadStatus(ref, newStatus) {
  const db = getDatabase();
  const nowIso = new Date().toISOString();

  const result = db.prepare(`
    UPDATE leads 
    SET status = ?, updated_at = ? 
    WHERE ref = ?
  `).run(newStatus, nowIso, ref);

  if (result.changes === 0) {
    return null;
  }

  return getLeadByRef(ref);
}

/**
 * Helper to clean and format lead record for JSON responses
 */
function formatLeadRecord(row) {
  if (!row) return null;
  const lead = { ...row };

  // Parse biz_docs_json if string
  if (lead.biz_docs_json && typeof lead.biz_docs_json === 'string') {
    try {
      lead.biz_docs = JSON.parse(lead.biz_docs_json);
    } catch (e) {
      lead.biz_docs = [];
    }
  }

  return lead;
}

module.exports = {
  generateReferenceNumber,
  createLead,
  getLeadByRef,
  getLeads,
  updateLeadStatus,
  formatLeadRecord
};
