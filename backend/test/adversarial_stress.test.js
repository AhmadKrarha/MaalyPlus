const { describe, it, before, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');
const { getDatabase } = require('../src/config/database');
const { setupTestDb, teardownTestDb, clearLeadsTable } = require('./helpers/testDb');

describe('Adversarial & Stress Test Suite for MaalyPlus API', () => {
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

  // Base valid fixtures for mutation testing
  const validIndividualPayload = () => ({
    applicant_type: 'فرد',
    ind_product: 'قرض شخصي',
    ind_amount: 10000,
    ind_tenor: 3,
    ind_sharia: 'لا يهمّني',
    ind_income: 1200,
    ind_obligations: 100,
    ind_employment: 'قطاع خاص',
    ind_job_years: '3 إلى 5 سنوات',
    ind_transfer: 'نعم',
    full_name: 'حسام الدين العبادي',
    phone: '0798765432',
    email: 'hussam.abbadi@example.com',
    governorate: 'عمّان',
    notes: 'ملاحظات تجريبية اعتيادية',
    consent: true
  });

  const validEnterprisePayload = () => ({
    applicant_type: 'منشأة',
    biz_name: 'شركة الصقر للخدمات اللوجستية',
    biz_legal: 'شركة ذات مسؤولية محدودة',
    biz_sector: 'خدمات لوجستية ونقل',
    biz_age: 'أكثر من 5 سنوات',
    biz_employees: '51 إلى 100',
    biz_revenue: 'أكثر من مليون',
    biz_purpose: 'شراء أسطول نقل جديد',
    biz_amount: 150000,
    biz_tenor: 5,
    biz_sharia: 'متوافق مع الشريعة فقط',
    contact_role: 'المدير المالي',
    doc_cr: 1,
    doc_license: 1,
    doc_financials: 1,
    doc_bank: 1,
    doc_tax: 1,
    doc_collateral: 1,
    full_name: 'زياد طلال القضاة',
    phone: '0771122334',
    email: 'ziad@falcon-logistics.jo',
    governorate: 'البلقاء',
    notes: 'مطلوب دراسة سريعة',
    consent: 1
  });

  // =========================================================================
  // 1. BOUNDARY VALUES & NUMERICAL EXTREMES
  // =========================================================================
  describe('1. Boundary Values & Numerical Extremes', () => {
    it('should reject zero and negative financing amounts', async () => {
      for (const invalidAmount of [0, -1, -50000, -0.001]) {
        const payload = { ...validIndividualPayload(), ind_amount: invalidAmount };
        const res = await request(app).post('/api/leads').send(payload).expect(400);
        assert.strictEqual(res.body.success, false);
        assert.ok(res.body.details.some(d => d.field === 'ind_amount'));
      }
    });

    it('should reject zero and negative tenors', async () => {
      for (const invalidTenor of [0, -1, -12]) {
        const payload = { ...validIndividualPayload(), ind_tenor: invalidTenor };
        const res = await request(app).post('/api/leads').send(payload).expect(400);
        assert.strictEqual(res.body.success, false);
        assert.ok(res.body.details.some(d => d.field === 'ind_tenor'));
      }
    });

    it('should reject negative monthly income', async () => {
      const payload = { ...validIndividualPayload(), ind_income: -500 };
      const res = await request(app).post('/api/leads').send(payload).expect(400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.details.some(d => d.field === 'ind_income'));
    });

    it('should accept zero monthly income (e.g. unemployed or pre-income)', async () => {
      const payload = { ...validIndividualPayload(), ind_income: 0 };
      const res = await request(app).post('/api/leads').send(payload).expect(201);
      assert.strictEqual(res.body.success, true);
    });

    it('should handle large realistic finance amounts and store exact values', async () => {
      const largeAmount = 50000000; // 50 Million JOD
      const payload = { ...validEnterprisePayload(), biz_amount: largeAmount };
      const res = await request(app).post('/api/leads').send(payload).expect(201);
      assert.strictEqual(res.body.success, true);

      const dbRow = db.prepare('SELECT biz_amount FROM leads WHERE ref = ?').get(res.body.data.ref);
      assert.strictEqual(dbRow.biz_amount, largeAmount);
    });

    it('should reject non-numeric string values in numeric fields', async () => {
      const payload = { ...validIndividualPayload(), ind_amount: 'five thousand' };
      const res = await request(app).post('/api/leads').send(payload).expect(400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.details.some(d => d.field === 'ind_amount'));
    });

    it('should reject names shorter than 2 characters', async () => {
      const payload = { ...validIndividualPayload(), full_name: 'أ' };
      const res = await request(app).post('/api/leads').send(payload).expect(400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.details.some(d => d.field === 'full_name'));
    });

    it('should accept long text in notes and full_name without crashing or truncation errors', async () => {
      const longNotes = 'ملاحظة '.repeat(1000); // 7000 characters
      const longName = 'عبد الرحمن محمد '.repeat(10).trim();
      const payload = { ...validIndividualPayload(), notes: longNotes, full_name: longName };

      const res = await request(app).post('/api/leads').send(payload).expect(201);
      assert.strictEqual(res.body.success, true);

      const dbRow = db.prepare('SELECT notes, full_name FROM leads WHERE ref = ?').get(res.body.data.ref);
      assert.strictEqual(dbRow.notes, longNotes);
      assert.strictEqual(dbRow.full_name, longName);
    });
  });

  // =========================================================================
  // 2. INVALID EMAILS AND PHONES
  // =========================================================================
  describe('2. Email and Phone Edge Cases', () => {
    const invalidEmails = [
      'not-an-email',
      '@missing-username.com',
      'user@.com',
      'user@domain..com',
      'user@domain,com',
      'user name@example.com',
      'user@'
    ];

    for (const badEmail of invalidEmails) {
      it(`should reject malformed email: "${badEmail}"`, async () => {
        const payload = { ...validIndividualPayload(), email: badEmail };
        const res = await request(app).post('/api/leads').send(payload).expect(400);
        assert.strictEqual(res.body.success, false);
        assert.ok(res.body.details.some(d => d.field === 'email'));
      });
    }

    const validEmailVariations = [
      'user.name+tag@example.co.uk',
      'finance_admin@sub.domain.jo',
      'info@maalyplus.com'
    ];

    for (const goodEmail of validEmailVariations) {
      it(`should accept valid complex email: "${goodEmail}"`, async () => {
        const payload = { ...validIndividualPayload(), email: goodEmail };
        const res = await request(app).post('/api/leads').send(payload).expect(201);
        assert.strictEqual(res.body.success, true);
      });
    }

    const invalidPhones = [
      '12345678', // 8 digits (too short)
      'phone_number', // letters only
      '079-abc-def', // not enough digits
      '   ' // spaces
    ];

    for (const badPhone of invalidPhones) {
      it(`should reject invalid phone: "${badPhone}"`, async () => {
        const payload = { ...validIndividualPayload(), phone: badPhone };
        const res = await request(app).post('/api/leads').send(payload).expect(400);
        assert.strictEqual(res.body.success, false);
        assert.ok(res.body.details.some(d => d.field === 'phone'));
      });
    }

    const validPhoneFormats = [
      '0791234567', // 10 digits Jordanian standard
      '+962 7 9123 4567', // international formatted
      '+962-79-1234567', // international with dashes
      '(079) 123-4567', // brackets and dashes
      '00962791234567' // 14 digits international prefix
    ];

    for (const goodPhone of validPhoneFormats) {
      it(`should accept formatted phone with sufficient digits: "${goodPhone}"`, async () => {
        const payload = { ...validIndividualPayload(), phone: goodPhone };
        const res = await request(app).post('/api/leads').send(payload).expect(201);
        assert.strictEqual(res.body.success, true);
      });
    }
  });

  // =========================================================================
  // 3. SQL INJECTION RESILIENCE
  // =========================================================================
  describe('3. SQL Injection Resilience Across All Fields & Endpoints', () => {
    const sqlInjectionStrings = [
      "' OR '1'='1",
      "'; DROP TABLE leads; --",
      "' UNION SELECT null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null --",
      "admin' --",
      "1; SELECT * FROM leads WHERE '1'='1",
      "' OR 1=1; --",
      "test@example.com' OR '1'='1",
      "` OR `1`=`1"
    ];

    for (const sqlPayload of sqlInjectionStrings) {
      it(`should safely escape SQL injection in full_name: "${sqlPayload.slice(0, 20)}..."`, async () => {
        const payload = {
          ...validIndividualPayload(),
          full_name: `سعيد ${sqlPayload}`,
          notes: `ملاحظة هامة: ${sqlPayload}`
        };

        const res = await request(app).post('/api/leads').send(payload).expect(201);
        assert.strictEqual(res.body.success, true);

        // Verify table still exists and is not dropped or corrupted
        const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='leads'").get();
        assert.ok(tableCheck);

        // Verify content was stored literally as data
        const saved = db.prepare('SELECT full_name, notes FROM leads WHERE ref = ?').get(res.body.data.ref);
        assert.strictEqual(saved.full_name, `سعيد ${sqlPayload}`);
        assert.strictEqual(saved.notes, `ملاحظة هامة: ${sqlPayload}`);
      });
    }

    it('should resist SQL injection in GET /api/leads/:ref endpoint', async () => {
      const maliciousRef = "MP-2608-0001' OR '1'='1";
      const res = await request(app).get(`/api/leads/${encodeURIComponent(maliciousRef)}`).expect(404);
      assert.strictEqual(res.body.success, false);
    });

    it('should resist SQL injection in GET /api/leads query parameters', async () => {
      // Insert one genuine lead first
      await request(app).post('/api/leads').send(validIndividualPayload()).expect(201);

      const maliciousParams = [
        "/api/leads?status=' OR '1'='1",
        "/api/leads?applicant_type=' OR '1'='1",
        "/api/leads?limit=10; DROP TABLE leads;"
      ];

      for (const pathUrl of maliciousParams) {
        const res = await request(app).get(pathUrl);
        // The endpoint should either handle it gracefully (200 with 0 matches or 200 with sanitized queries)
        assert.ok([200, 400].includes(res.status));
      }

      // Check table is intact and has exactly 1 row
      const countRow = db.prepare('SELECT COUNT(*) as total FROM leads').get();
      assert.strictEqual(Number(countRow.total), 1);
    });
  });

  // =========================================================================
  // 4. UNICODE ARABIC, DIACRITICS, HARAKAT & SPECIAL CHARACTERS
  // =========================================================================
  describe('4. Unicode Arabic, Harakat, RTL & Emojis', () => {
    it('should handle full Arabic diacritics (Harakat / Tashkeel)', async () => {
      const payload = {
        ...validIndividualPayload(),
        full_name: 'مُحَمَّد عَبْدُ الرَّحْمَنِ بْنُ سُليْمَان',
        ind_product: 'تَمْوِيلٌ شَخْصِيٌّ مُتَوَافِقٌ مَعَ الشَّرِيعَةِ',
        governorate: 'عَمَّانُ'
      };

      const res = await request(app).post('/api/leads').send(payload).expect(201);
      assert.strictEqual(res.body.success, true);

      const saved = db.prepare('SELECT full_name, ind_product, governorate FROM leads WHERE ref = ?').get(res.body.data.ref);
      assert.strictEqual(saved.full_name, 'مُحَمَّد عَبْدُ الرَّحْمَنِ بْنُ سُليْمَان');
      assert.strictEqual(saved.ind_product, 'تَمْوِيلٌ شَخْصِيٌّ مُتَوَافِقٌ مَعَ الشَّرِيعَةِ');
      assert.strictEqual(saved.governorate, 'عَمَّانُ');
    });

    it('should handle RTL Unicode markups and Multilingual characters', async () => {
      const payload = {
        ...validEnterprisePayload(),
        biz_name: 'شركة الوفاق & Partner - For Trading & Co. (ش.ذ.م.م)',
        notes: 'ملاحظة تتضمن رموز خاصة: & < > " \' / \\ @ # $ % ^ * ( ) _ + ~ 🚀📈'
      };

      const res = await request(app).post('/api/leads').send(payload).expect(201);
      assert.strictEqual(res.body.success, true);

      const saved = db.prepare('SELECT biz_name, notes FROM leads WHERE ref = ?').get(res.body.data.ref);
      assert.strictEqual(saved.biz_name, 'شركة الوفاق & Partner - For Trading & Co. (ش.ذ.م.م)');
      assert.strictEqual(saved.notes, 'ملاحظة تتضمن رموز خاصة: & < > " \' / \\ @ # $ % ^ * ( ) _ + ~ 🚀📈');
    });
  });

  // =========================================================================
  // 5. HONEYPOT & BOT PROTECTION
  // =========================================================================
  describe('5. Honeypot & Spam Bot Trapping', () => {
    it('should reject request when bot-field contains text', async () => {
      const payload = {
        ...validIndividualPayload(),
        'bot-field': 'I am an automated crawler bot filling hidden inputs'
      };

      const res = await request(app).post('/api/leads').send(payload).expect(400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'Bot submission detected');

      // Verify no row was inserted in database
      const count = db.prepare('SELECT COUNT(*) as total FROM leads').get();
      assert.strictEqual(Number(count.total), 0);
    });

    it('should accept submission when bot-field is empty string or undefined', async () => {
      const payloadWithEmptyBot = {
        ...validIndividualPayload(),
        'bot-field': ''
      };

      const res = await request(app).post('/api/leads').send(payloadWithEmptyBot).expect(201);
      assert.strictEqual(res.body.success, true);
    });
  });

  // =========================================================================
  // 6. MISSING HEADERS, MALFORMED JSON & LARGE PAYLOADS
  // =========================================================================
  describe('6. Request Headers, Content-Types & Payload Limits', () => {
    it('should handle malformed JSON syntax gracefully with 400 status', async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Content-Type', 'application/json')
        .send('{"applicant_type": "فرد", "full_name": "احمد", broken json')
        .expect(400);

      assert.strictEqual(res.body.success, false);
    });

    it('should handle unexpected Content-Type headers (e.g. text/plain)', async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Content-Type', 'text/plain')
        .send('just a text payload')
        .expect(400);

      assert.strictEqual(res.body.success, false);
    });

    it('should accept URL-encoded form submissions with Arabic characters', async () => {
      const formPayload = {
        applicant_type: 'فرد',
        full_name: 'طارق عبد الله',
        phone: '0799887766',
        email: 'tareq.abd@example.com',
        governorate: 'إربد',
        ind_product: 'تمويل سيارة',
        ind_amount: '18000',
        ind_tenor: '4',
        ind_income: '900',
        ind_employment: 'قطاع خاص',
        consent: 'نعم'
      };

      const res = await request(app)
        .post('/api/leads')
        .type('form')
        .send(formPayload)
        .expect(201);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.applicant_type, 'فرد');
    });

    it('should reject payloads exceeding body parser limit (5MB)', async () => {
      const giantString = 'A'.repeat(6 * 1024 * 1024); // 6MB
      const res = await request(app)
        .post('/api/leads')
        .send({
          ...validIndividualPayload(),
          notes: giantString
        });

      assert.strictEqual(res.status, 413); // Payload Too Large
    });
  });

  // =========================================================================
  // 7. HIGH CONCURRENCY & BURST TESTING
  // =========================================================================
  describe('7. High Concurrency & Burst POST Requests', () => {
    it('should process 50 concurrent POST requests with unique reference generation and zero data loss', async () => {
      const totalRequests = 50;
      const promises = [];

      for (let i = 0; i < totalRequests; i++) {
        const payload = {
          applicant_type: i % 2 === 0 ? 'فرد' : 'منشأة',
          full_name: `مستخدم رقم ${i + 1}`,
          phone: `079${String(1000000 + i).padStart(7, '0')}`,
          email: `concurrent.user.${i + 1}@loadtest.com`,
          governorate: 'عمّان',
          ind_product: 'قرض شخصي',
          ind_amount: 5000 + i * 100,
          ind_tenor: 3,
          ind_income: 800,
          ind_employment: 'قطاع خاص',
          biz_name: `شركة رقم ${i + 1}`,
          biz_sector: 'خدمات',
          biz_purpose: 'سيولة',
          biz_amount: 20000 + i * 1000,
          biz_tenor: 3,
          consent: 1
        };

        promises.push(request(app).post('/api/leads').send(payload));
      }

      const results = await Promise.all(promises);

      // Verify every single request succeeded with 201 Created
      const refs = new Set();
      for (const res of results) {
        assert.strictEqual(res.status, 201, `Expected 201 Created but got ${res.status}: ${JSON.stringify(res.body)}`);
        assert.strictEqual(res.body.success, true);
        assert.ok(res.body.data.ref);
        refs.add(res.body.data.ref);
      }

      // Verify all generated reference IDs are 100% unique (no collisions)
      assert.strictEqual(refs.size, totalRequests, 'Every request must produce a unique reference number');

      // Verify SQLite row count matches exactly 50
      const countRow = db.prepare('SELECT COUNT(*) as total FROM leads').get();
      assert.strictEqual(Number(countRow.total), totalRequests);
    });
  });

  // =========================================================================
  // 8. QUERY PARAMETERS, PAGINATION LIMITS & EDGE CASES
  // =========================================================================
  describe('8. GET /api/leads Query Limits, Offset and Filtering', () => {
    beforeEach(async () => {
      // Seed 15 test records (10 individual, 5 enterprise)
      for (let i = 1; i <= 10; i++) {
        await request(app).post('/api/leads').send({
          ...validIndividualPayload(),
          full_name: `فرد تجريبي ${i}`,
          phone: `079111111${i % 10}`,
          email: `ind${i}@test.com`
        });
      }
      for (let i = 1; i <= 5; i++) {
        await request(app).post('/api/leads').send({
          ...validEnterprisePayload(),
          biz_name: `منشأة تجريبية ${i}`,
          phone: `078222222${i % 10}`,
          email: `ent${i}@test.com`
        });
      }
    });

    it('should paginate correctly with limit and offset', async () => {
      const page1 = await request(app).get('/api/leads?limit=5&offset=0').expect(200);
      assert.strictEqual(page1.body.count, 5);
      assert.strictEqual(page1.body.total, 15);

      const page2 = await request(app).get('/api/leads?limit=5&offset=5').expect(200);
      assert.strictEqual(page2.body.count, 5);
      assert.strictEqual(page2.body.total, 15);

      // Verify different records on page 1 vs page 2
      const page1Refs = page1.body.data.map(r => r.ref);
      const page2Refs = page2.body.data.map(r => r.ref);
      for (const ref of page1Refs) {
        assert.ok(!page2Refs.includes(ref), 'Page 1 and Page 2 records should not overlap');
      }
    });

    it('should filter correctly by applicant_type', async () => {
      const indRes = await request(app).get('/api/leads?applicant_type=فرد').expect(200);
      assert.strictEqual(indRes.body.count, 10);
      assert.strictEqual(indRes.body.total, 10);

      const bizRes = await request(app).get('/api/leads?applicant_type=منشأة').expect(200);
      assert.strictEqual(bizRes.body.count, 5);
      assert.strictEqual(bizRes.body.total, 5);
    });

    it('should return empty list when no matches found', async () => {
      const res = await request(app).get('/api/leads?status=closed').expect(200);
      assert.strictEqual(res.body.count, 0);
      assert.strictEqual(res.body.total, 0);
      assert.deepStrictEqual(res.body.data, []);
    });

    it('should handle non-numeric limit/offset by falling back safely', async () => {
      const res = await request(app).get('/api/leads?limit=invalid&offset=invalid').expect(200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.total, 15);
    });
  });

  // =========================================================================
  // 9. HEALTH CHECK STRESS & ERROR SIMULATION
  // =========================================================================
  describe('9. Health & System Status Reliability', () => {
    it('GET /api/health returns 200 with ISO timestamp and connected database', async () => {
      const res = await request(app).get('/api/health').expect(200);
      assert.strictEqual(res.body.status, 'ok');
      assert.strictEqual(res.body.database, 'connected');
      assert.ok(res.body.timestamp);
      assert.ok(new Date(res.body.timestamp).toISOString());
    });
  });
});
