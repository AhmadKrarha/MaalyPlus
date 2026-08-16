const { describe, it, before, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');
const { getDatabase } = require('../src/config/database');
const { normalizeArabicNumerals, coerceNumber } = require('../src/validators/leadValidator');
const { setupTestDb, teardownTestDb, clearLeadsTable } = require('./helpers/testDb');

describe('Eastern Arabic Numerals & Query Array Robustness Tests', () => {
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

  // =========================================================================
  // 1. Unit Tests for Normalization Functions
  // =========================================================================
  describe('1. Unit Tests for normalizeArabicNumerals and coerceNumber', () => {
    it('should convert all Eastern Arabic numerals (٠-٩) to ASCII (0-9)', () => {
      assert.strictEqual(normalizeArabicNumerals('٠١٢٣٤٥٦٧٨٩'), '0123456789');
      assert.strictEqual(normalizeArabicNumerals('٠٧٩١٢٣٤٥٦٧'), '0791234567');
      assert.strictEqual(normalizeArabicNumerals('١٥٠٠٠'), '15000');
    });

    it('should convert Extended Arabic-Indic numerals (۰-۹) to ASCII (0-9)', () => {
      assert.strictEqual(normalizeArabicNumerals('۰۱۲۳۴۵۶۷۸۹'), '0123456789');
      assert.strictEqual(normalizeArabicNumerals('۰۷۸۱۲۳۴۵۶۷'), '0781234567');
    });

    it('should convert Arabic decimal separator (٫) to period (.)', () => {
      assert.strictEqual(normalizeArabicNumerals('٧٫٧٥'), '7.75');
      assert.strictEqual(normalizeArabicNumerals('١٢٥٠٫٥٠'), '1250.50');
    });

    it('should remove Arabic thousands separator (٬)', () => {
      assert.strictEqual(normalizeArabicNumerals('١٥٬٠٠٠'), '15000');
    });

    it('should pass through non-string or already ASCII values unchanged', () => {
      assert.strictEqual(normalizeArabicNumerals('12345'), '12345');
      assert.strictEqual(normalizeArabicNumerals(123), 123);
      assert.strictEqual(normalizeArabicNumerals(null), null);
      assert.strictEqual(normalizeArabicNumerals(undefined), undefined);
    });

    it('coerceNumber should convert Eastern Arabic numeric strings to Number', () => {
      assert.strictEqual(coerceNumber('١٥٠٠٠'), 15000);
      assert.strictEqual(coerceNumber('٣'), 3);
      assert.strictEqual(coerceNumber('٩٥٠٫٥'), 950.5);
      assert.strictEqual(coerceNumber('0'), 0);
      assert.strictEqual(coerceNumber('٠'), 0);
      assert.strictEqual(coerceNumber(undefined), undefined);
      assert.strictEqual(coerceNumber(null), undefined);
      assert.strictEqual(coerceNumber(''), undefined);
      assert.strictEqual(coerceNumber('invalid'), 'invalid');
    });
  });

  // =========================================================================
  // 2. Integration Tests: POST /api/leads with Eastern Arabic Numerals
  // =========================================================================
  describe('2. POST /api/leads with Eastern Arabic Numerals', () => {
    it('should accept and accurately persist an Individual lead with Eastern Arabic numerals', async () => {
      const payload = {
        applicant_type: 'فرد',
        ind_product: 'قرض شخصي',
        ind_amount: '١٥٠٠٠',       // 15000
        ind_tenor: '٣',             // 3
        ind_income: '٩٥٠',          // 950
        ind_obligations: '١٢٠',     // 120
        ind_employment: 'قطاع خاص',
        ind_job_years: '٣ سنوات',
        ind_transfer: 'نعم',
        full_name: 'أحمد محمود العبدالله',
        phone: '٠٧٩١٢٣٤٥٦٧',       // 0791234567
        email: 'ahmad.arabic@example.com',
        governorate: 'عمّان',
        notes: 'طلب تمويل شخصي بالأرقام العربية',
        consent: '١',               // 1
        est_rate_used: '٧٫٧٥'       // 7.75
      };

      const res = await request(app)
        .post('/api/leads')
        .send(payload)
        .expect(201);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.applicant_type, 'فرد');
      assert.strictEqual(res.body.data.status, 'pending');
      assert.match(res.body.data.ref, /^MP-\d{4}-\d{4}$/);

      // Verify direct database persistence
      const dbRow = db.prepare('SELECT * FROM leads WHERE ref = ?').get(res.body.data.ref);
      assert.ok(dbRow);
      assert.strictEqual(dbRow.full_name, 'أحمد محمود العبدالله');
      assert.strictEqual(dbRow.phone, '0791234567');
      assert.strictEqual(dbRow.ind_amount, 15000);
      assert.strictEqual(dbRow.ind_tenor, 3);
      assert.strictEqual(dbRow.ind_income, 950);
      assert.strictEqual(dbRow.ind_obligations, 120);
      assert.strictEqual(dbRow.consent, 1);
      assert.strictEqual(dbRow.est_rate_used, 7.75);
    });

    it('should accept and accurately persist an Enterprise lead with Eastern Arabic numerals and checklist flags', async () => {
      const payload = {
        applicant_type: 'منشأة',
        biz_name: 'شركة الهدى للتجارة',
        biz_legal: 'شركة ذات مسؤولية محدودة',
        biz_sector: 'تجارة تجزئة',
        biz_age: '٥ سنوات',
        biz_employees: '١٥',
        biz_revenue: '٢٥٠ ألف',
        biz_purpose: 'شراء بضائع ومخزون',
        biz_amount: '٧٥٠٠٠',        // 75000
        biz_tenor: '٤',             // 4
        biz_sharia: 'متوافق مع الشريعة فقط',
        contact_role: 'المدير العام',
        doc_cr: '١',                // 1
        doc_license: '١',           // 1
        doc_financials: '٠',        // 0
        doc_bank: '١',              // 1
        doc_tax: '٠',               // 0
        doc_collateral: '١',        // 1
        full_name: 'زياد حسن الشريف',
        phone: '٠٧٨٨٧٦٥٤٣٢',       // 0788765432
        email: 'ziad@elhoda.jo',
        governorate: 'الزرقاء',
        notes: 'تمويل تجارة بالأرقام المشرقية',
        consent: 'نعم'
      };

      const res = await request(app)
        .post('/api/leads')
        .send(payload)
        .expect(201);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.applicant_type, 'منشأة');

      const dbRow = db.prepare('SELECT * FROM leads WHERE ref = ?').get(res.body.data.ref);
      assert.ok(dbRow);
      assert.strictEqual(dbRow.biz_name, 'شركة الهدى للتجارة');
      assert.strictEqual(dbRow.phone, '0788765432');
      assert.strictEqual(dbRow.biz_amount, 75000);
      assert.strictEqual(dbRow.biz_tenor, 4);
      assert.strictEqual(dbRow.doc_cr, 1);
      assert.strictEqual(dbRow.doc_license, 1);
      assert.strictEqual(dbRow.doc_financials, 0);
      assert.strictEqual(dbRow.doc_bank, 1);
      assert.strictEqual(dbRow.doc_tax, 0);
      assert.strictEqual(dbRow.doc_collateral, 1);
    });
  });

  // =========================================================================
  // 3. Integration Tests: GET /api/leads with Array Query Parameters
  // =========================================================================
  describe('3. GET /api/leads Array Query Parameter Handling', () => {
    beforeEach(async () => {
      // Seed 2 records
      await request(app).post('/api/leads').send({
        applicant_type: 'فرد',
        ind_product: 'قرض شخصي',
        ind_amount: 10000,
        ind_tenor: 3,
        ind_income: 1000,
        ind_employment: 'قطاع خاص',
        full_name: 'سالم أحمد',
        phone: '0791112233',
        email: 'salem@test.com',
        governorate: 'عمّان',
        consent: true
      });

      await request(app).post('/api/leads').send({
        applicant_type: 'منشأة',
        biz_name: 'مؤسسة النجم للتجارة',
        biz_sector: 'تجارة',
        biz_purpose: 'سيولة',
        biz_amount: 50000,
        biz_tenor: 3,
        full_name: 'عمر القاسم',
        phone: '0782223344',
        email: 'omar@test.com',
        governorate: 'إربد',
        consent: true
      });
    });

    it('should safely handle duplicate status query parameters (array) without throwing RangeError', async () => {
      const res = await request(app)
        .get('/api/leads?status=pending&status=closed')
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(typeof res.body.total, 'number');
      assert.strictEqual(res.body.total, 2); // Status 'pending' matches both
    });

    it('should safely handle duplicate applicant_type query parameters (array)', async () => {
      const res = await request(app)
        .get('/api/leads?applicant_type=فرد&applicant_type=منشأة')
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.total, 1); // Uses first element 'فرد'
      assert.strictEqual(res.body.data[0].applicant_type, 'فرد');
    });

    it('should safely handle type alias parameter and duplicate type parameters', async () => {
      const res = await request(app)
        .get('/api/leads?type=فرد&type=منشأة')
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.total, 1);
      assert.strictEqual(res.body.data[0].applicant_type, 'فرد');
    });

    it('should safely handle duplicate limit and offset parameters', async () => {
      const res = await request(app)
        .get('/api/leads?limit=1&limit=10&offset=0&offset=5')
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.count, 1); // limit=1 taken
      assert.strictEqual(res.body.total, 2);
    });
  });
});
