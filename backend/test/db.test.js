const { describe, it, before, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const { getDatabase } = require('../src/config/database');
const { createLead, getLeadByRef } = require('../src/services/leadService');
const { setupTestDb, teardownTestDb, clearLeadsTable } = require('./helpers/testDb');

describe('Direct SQLite Database Verification Tests', () => {
  let db;

  before(() => {
    db = setupTestDb();
  });

  beforeEach(() => {
    clearLeadsTable();
  });

  after(() => {
    teardownTestDb();
  });

  it('should verify schema table columns and indexes in SQLite catalog', () => {
    // Check that leads table exists
    const tableInfo = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='leads'
    `).get();
    assert.ok(tableInfo, 'Table "leads" must exist in sqlite_master');

    // Check indexes
    const indexes = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND tbl_name='leads'
    `).all().map(r => r.name);

    assert.ok(indexes.includes('idx_leads_ref'), 'Index idx_leads_ref must exist');
    assert.ok(indexes.includes('idx_leads_status'), 'Index idx_leads_status must exist');
    assert.ok(indexes.includes('idx_leads_applicant_type'), 'Index idx_leads_applicant_type must exist');
    assert.ok(indexes.includes('idx_leads_created_at'), 'Index idx_leads_created_at must exist');
  });

  it('should accurately store and retrieve an individual lead from SQLite table', () => {
    const individualData = {
      applicant_type: 'فرد',
      ind_product: 'قرض شخصي',
      ind_amount: 8500,
      ind_tenor: 3,
      ind_sharia: 'لا يهمّني',
      ind_income: 750,
      ind_obligations: 50,
      ind_employment: 'قطاع خاص',
      ind_job_years: 'سنتان إلى 5 سنوات',
      ind_transfer: 'نعم',
      full_name: 'منى السالم',
      phone: '0795556677',
      email: 'muna.salem@example.com',
      governorate: 'عمّان',
      notes: 'أفضّل التواصل عبر الواتساب',
      consent: 1,
      est_rate_used: 7.75
    };

    // 1. Create lead using service
    const created = createLead(individualData, {
      ip: '127.0.0.1',
      userAgent: 'NodeTestRunner/1.0'
    });

    assert.ok(created.id, 'Created record must have an auto-incremented id');
    assert.match(created.ref, /^MP-\d{4}-\d{4}$/, 'Created record must have a valid reference format');

    // 2. Direct SQLite query assertion
    const dbRow = db.prepare('SELECT * FROM leads WHERE ref = ?').get(created.ref);

    assert.ok(dbRow, 'Record must be queryable directly via SQL statement');
    assert.strictEqual(dbRow.applicant_type, 'فرد');
    assert.strictEqual(dbRow.full_name, 'منى السالم');
    assert.strictEqual(dbRow.phone, '0795556677');
    assert.strictEqual(dbRow.email, 'muna.salem@example.com');
    assert.strictEqual(dbRow.governorate, 'عمّان');
    assert.strictEqual(dbRow.ind_product, 'قرض شخصي');
    assert.strictEqual(dbRow.ind_amount, 8500);
    assert.strictEqual(dbRow.ind_tenor, 3);
    assert.strictEqual(dbRow.ind_income, 750);
    assert.strictEqual(dbRow.ind_obligations, 50);
    assert.strictEqual(dbRow.ind_employment, 'قطاع خاص');
    assert.strictEqual(dbRow.ind_job_years, 'سنتان إلى 5 سنوات');
    assert.strictEqual(dbRow.ind_transfer, 'نعم');
    assert.strictEqual(dbRow.status, 'pending');
    assert.strictEqual(dbRow.consent, 1);
    assert.strictEqual(dbRow.notes, 'أفضّل التواصل عبر الواتساب');
    assert.strictEqual(dbRow.ip_address, '127.0.0.1');
    assert.strictEqual(dbRow.user_agent, 'NodeTestRunner/1.0');
    assert.ok(dbRow.created_at);
    assert.ok(dbRow.payload_json);

    // Verify payload JSON backup contains the raw input
    const parsedPayload = JSON.parse(dbRow.payload_json);
    assert.strictEqual(parsedPayload.full_name, 'منى السالم');
  });

  it('should accurately store and retrieve an enterprise lead with document flags from SQLite table', () => {
    const enterpriseData = {
      applicant_type: 'منشأة',
      biz_name: 'شركة النور للحلول البرمجية',
      biz_legal: 'شركة ذات مسؤولية محدودة',
      biz_sector: 'تقنية معلومات وبرمجيات',
      biz_age: '3 إلى 5 سنوات',
      biz_employees: '6 إلى 20',
      biz_revenue: '150 إلى 500 ألف',
      biz_purpose: 'توسعة أو فرع جديد',
      biz_amount: 45000,
      biz_tenor: 3,
      biz_sharia: 'متوافق مع الشريعة فقط',
      contact_role: 'المدير التنفيذي',
      doc_cr: 1,
      doc_license: 1,
      doc_financials: 1,
      doc_bank: 1,
      doc_tax: 1,
      doc_collateral: 0,
      full_name: 'مروان حداد',
      phone: '0770009988',
      email: 'marwan@alnoor-tech.jo',
      governorate: 'عمّان',
      notes: 'فرع جديد في إربد',
      consent: 1
    };

    const created = createLead(enterpriseData, {
      ip: '192.168.1.50',
      userAgent: 'Mozilla/5.0'
    });

    // Direct SQL assertion
    const dbRow = db.prepare('SELECT * FROM leads WHERE ref = ?').get(created.ref);

    assert.ok(dbRow);
    assert.strictEqual(dbRow.applicant_type, 'منشأة');
    assert.strictEqual(dbRow.biz_name, 'شركة النور للحلول البرمجية');
    assert.strictEqual(dbRow.biz_legal, 'شركة ذات مسؤولية محدودة');
    assert.strictEqual(dbRow.biz_sector, 'تقنية معلومات وبرمجيات');
    assert.strictEqual(dbRow.biz_amount, 45000);
    assert.strictEqual(dbRow.biz_tenor, 3);
    assert.strictEqual(dbRow.doc_cr, 1);
    assert.strictEqual(dbRow.doc_license, 1);
    assert.strictEqual(dbRow.doc_financials, 1);
    assert.strictEqual(dbRow.doc_bank, 1);
    assert.strictEqual(dbRow.doc_tax, 1);
    assert.strictEqual(dbRow.doc_collateral, 0);

    const bizDocs = JSON.parse(dbRow.biz_docs_json);
    assert.deepStrictEqual(bizDocs, ['doc_cr', 'doc_license', 'doc_financials', 'doc_bank', 'doc_tax']);
  });
});
