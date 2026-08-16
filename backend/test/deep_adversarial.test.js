const { describe, it, before, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');
const { getDatabase } = require('../src/config/database');
const { setupTestDb, teardownTestDb, clearLeadsTable } = require('./helpers/testDb');

describe('Deep Adversarial & Edge Case Exploration Suite', () => {
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

  const validBase = () => ({
    applicant_type: 'فرد',
    ind_product: 'تمويل سيارة',
    ind_amount: 12000,
    ind_tenor: 4,
    ind_sharia: 'متوافق مع الشريعة فقط',
    ind_income: 1100,
    ind_obligations: 0,
    ind_employment: 'قطاع خاص',
    ind_job_years: '1 إلى سنتان',
    ind_transfer: 'نعم',
    full_name: 'ياسين أحمد الطراونة',
    phone: '0795551234',
    email: 'yaseen.tarawneh@example.com',
    governorate: 'الكرك',
    notes: 'معاملة شراء مركبة هجينة',
    consent: true
  });

  // =========================================================================
  // A. TYPE CONFUSION & OBJECT INJECTION (NoSQL / SQL Injection via Types)
  // =========================================================================
  describe('A. Type Confusion & Object/Array Injection', () => {
    it('should reject when full_name is an object or array', async () => {
      const payloadObject = { ...validBase(), full_name: { malicious: 'injection' } };
      const resObj = await request(app).post('/api/leads').send(payloadObject).expect(400);
      assert.strictEqual(resObj.body.success, false);
      assert.ok(resObj.body.details.some(d => d.field === 'full_name'));

      const payloadArray = { ...validBase(), full_name: ['أحمد', 'محمد'] };
      const resArr = await request(app).post('/api/leads').send(payloadArray).expect(400);
      assert.strictEqual(resArr.body.success, false);
      assert.ok(resArr.body.details.some(d => d.field === 'full_name'));
    });

    it('should reject when phone is an object or array', async () => {
      const payload = { ...validBase(), phone: { $regex: '.*' } };
      const res = await request(app).post('/api/leads').send(payload).expect(400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.details.some(d => d.field === 'phone'));
    });

    it('should reject when ind_amount is an object or array', async () => {
      const payload = { ...validBase(), ind_amount: { value: 5000 } };
      const res = await request(app).post('/api/leads').send(payload).expect(400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.details.some(d => d.field === 'ind_amount'));
    });
  });

  // =========================================================================
  // B. PROTOTYPE POLLUTION PAYLOADS
  // =========================================================================
  describe('B. Prototype Pollution Attacks', () => {
    it('should prevent prototype pollution in JSON body', async () => {
      const maliciousJson = JSON.stringify({
        ...validBase(),
        __proto__: { isAdmin: true, polluted: 'yes' },
        constructor: { prototype: { hacked: true } }
      });

      const res = await request(app)
        .post('/api/leads')
        .set('Content-Type', 'application/json')
        .send(maliciousJson)
        .expect(201);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(({})['isAdmin'], undefined);
      assert.strictEqual(({})['polluted'], undefined);
      assert.strictEqual(({})['hacked'], undefined);
    });
  });

  // =========================================================================
  // C. XSS, HTML INJECTION & JAVASCRIPT PAYLOADS
  // =========================================================================
  describe('C. XSS & HTML Script Tag Injection Handling', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(document.cookie)">',
      '<svg onload=alert(1)>',
      '"><script>alert(1)</script>',
      'javascript:/*--></title></style></textarea></script></xmp><svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>'
    ];

    for (const xss of xssPayloads) {
      it(`should safely persist and return raw XSS payload without execution: ${xss.slice(0, 25)}`, async () => {
        const payload = {
          ...validBase(),
          full_name: `سعيد ${xss}`,
          notes: `تفاصيل الطلب: ${xss}`
        };

        const res = await request(app).post('/api/leads').send(payload).expect(201);
        assert.strictEqual(res.body.success, true);

        // Fetch back and verify exact content is preserved without server error
        const getRes = await request(app).get(`/api/leads/${res.body.data.ref}`).expect(200);
        assert.strictEqual(getRes.body.data.full_name, `سعيد ${xss}`);
        assert.strictEqual(getRes.body.data.notes, `تفاصيل الطلب: ${xss}`);
      });
    }
  });

  // =========================================================================
  // D. CONSENT VALUES STRICTNESS
  // =========================================================================
  describe('D. Consent Field Strictness & Truthiness', () => {
    const falsyConsents = [false, 0, '0', 'false', 'off', 'no', 'لا', null, undefined, ''];

    for (const badConsent of falsyConsents) {
      it(`should reject submission when consent is: ${JSON.stringify(badConsent)}`, async () => {
        const payload = { ...validBase(), consent: badConsent };
        const res = await request(app).post('/api/leads').send(payload).expect(400);
        assert.strictEqual(res.body.success, false);
        assert.ok(res.body.details.some(d => d.field === 'consent'));
      });
    }

    const truthyConsents = [true, 1, '1', 'true', 'نعم', 'on', 'نعم، أوافق'];

    for (const goodConsent of truthyConsents) {
      it(`should accept submission when consent is: ${JSON.stringify(goodConsent)}`, async () => {
        const payload = { ...validBase(), consent: goodConsent };
        const res = await request(app).post('/api/leads').send(payload).expect(201);
        assert.strictEqual(res.body.success, true);
      });
    }
  });

  // =========================================================================
  // E. QUERY PARAMETER TAMPERING
  // =========================================================================
  describe('E. Query Parameter Tampering', () => {
    beforeEach(async () => {
      await request(app).post('/api/leads').send(validBase()).expect(201);
    });

    it('should handle single query parameters cleanly', async () => {
      const res = await request(app).get('/api/leads?status=pending').expect(200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.count, 1);
    });

    it('should handle negative limit and offset values gracefully', async () => {
      const res = await request(app).get('/api/leads?limit=-10&offset=-5').expect(200);
      assert.strictEqual(res.body.success, true);
    });

    it('should handle extreme offset values exceeding table rows', async () => {
      const res = await request(app).get('/api/leads?limit=10&offset=1000000').expect(200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.count, 0);
      assert.deepStrictEqual(res.body.data, []);
    });
  });

  // =========================================================================
  // F. HTTP METHOD & ROUTE FUZZING
  // =========================================================================
  describe('F. HTTP Method Fuzzing & Unsupported Verbs', () => {
    it('OPTIONS /api/leads should return CORS allowed methods headers', async () => {
      const res = await request(app).options('/api/leads').expect(204);
      assert.ok(res.headers['access-control-allow-methods']);
      assert.ok(res.headers['access-control-allow-origin']);
    });

    it('DELETE /api/leads should return 404', async () => {
      const res = await request(app).delete('/api/leads').expect(404);
      assert.strictEqual(res.body.success, false);
    });

    it('PUT /api/leads should return 404', async () => {
      const res = await request(app).put('/api/leads').expect(404);
      assert.strictEqual(res.body.success, false);
    });
  });

  // =========================================================================
  // G. ULTRA HIGH BURST CONCURRENCY (100 parallel requests)
  // =========================================================================
  describe('G. Ultra High Burst Concurrency (100 parallel POST requests)', () => {
    it('should handle 100 concurrent POST requests with zero reference collisions and exact DB count', async () => {
      const count = 100;
      const promises = [];

      for (let i = 0; i < count; i++) {
        const payload = {
          applicant_type: 'فرد',
          ind_product: 'تمويل سكني',
          ind_amount: 30000 + i * 500,
          ind_tenor: 10,
          ind_income: 1500,
          ind_employment: 'قطاع عام',
          full_name: `عميل الإجهاد رقم ${i + 1}`,
          phone: `079${String(2000000 + i).padStart(7, '0')}`,
          email: `stress.${i + 1}@burst-test.com`,
          governorate: 'عمّان',
          consent: 1
        };
        promises.push(request(app).post('/api/leads').send(payload));
      }

      const results = await Promise.all(promises);

      const generatedRefs = new Set();
      for (const res of results) {
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.success, true);
        assert.ok(res.body.data.ref);
        generatedRefs.add(res.body.data.ref);
      }

      assert.strictEqual(generatedRefs.size, count, `Expected ${count} unique reference IDs, got ${generatedRefs.size}`);

      const dbTotal = db.prepare('SELECT COUNT(*) as total FROM leads').get();
      assert.strictEqual(Number(dbTotal.total), count);
    });
  });
});
