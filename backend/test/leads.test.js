const { describe, it, before, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');
const { setupTestDb, teardownTestDb, clearLeadsTable } = require('./helpers/testDb');

describe('Leads API Integration Tests', () => {
  before(() => {
    setupTestDb();
  });

  beforeEach(() => {
    clearLeadsTable();
  });

  after(() => {
    teardownTestDb();
  });

  describe('POST /api/leads - Individual Track', () => {
    const validIndividualLead = {
      applicant_type: 'فرد',
      ind_product: 'قرض شخصي',
      ind_amount: 15000,
      ind_tenor: 5,
      ind_sharia: 'لا يهمّني',
      ind_income: 950,
      ind_obligations: 120,
      ind_employment: 'قطاع خاص',
      ind_job_years: 'أكثر من 5 سنوات',
      ind_transfer: 'نعم',
      full_name: 'أحمد محمود العبدالله',
      phone: '0791234567',
      email: 'ahmad.mahmoud@example.com',
      governorate: 'عمّان',
      notes: 'طلب قرض لغايات تجديد المنزل',
      consent: true
    };

    it('should submit a valid individual lead (JSON) and return 201 Created with ref', async () => {
      const res = await request(app)
        .post('/api/leads')
        .send(validIndividualLead)
        .set('Accept', 'application/json')
        .expect(201);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Lead received and registered successfully');
      assert.ok(res.body.data);
      assert.strictEqual(res.body.data.applicant_type, 'فرد');
      assert.strictEqual(res.body.data.status, 'pending');
      assert.match(res.body.data.ref, /^MP-\d{4}-\d{4}$/);
      assert.ok(res.body.data.created_at);
    });

    it('should accept URL-encoded form submissions', async () => {
      const res = await request(app)
        .post('/api/leads')
        .type('form')
        .send({
          ...validIndividualLead,
          ind_amount: '20000',
          ind_tenor: '4',
          ind_income: '1200',
          ind_obligations: '200',
          consent: 'نعم'
        })
        .expect(201);

      assert.strictEqual(res.body.success, true);
      assert.match(res.body.data.ref, /^MP-\d{4}-\d{4}$/);
    });

    it('should accept submissions via alias POST /api/finance-request', async () => {
      const res = await request(app)
        .post('/api/finance-request')
        .send(validIndividualLead)
        .expect(201);

      assert.strictEqual(res.body.success, true);
      assert.match(res.body.data.ref, /^MP-\d{4}-\d{4}$/);
    });
  });

  describe('POST /api/leads - Enterprise Track', () => {
    const validEnterpriseLead = {
      applicant_type: 'منشأة',
      biz_name: 'شركة الأمل للمقاولات والتوريدات',
      biz_legal: 'شركة ذات مسؤولية محدودة',
      biz_sector: 'مقاولات وإنشاءات',
      biz_age: '3 إلى 5 سنوات',
      biz_employees: '21 إلى 50',
      biz_revenue: '500 ألف إلى مليون',
      biz_purpose: 'رأس مال عامل وسيولة',
      biz_amount: 75000,
      biz_tenor: 4,
      biz_sharia: 'متوافق مع الشريعة فقط',
      contact_role: 'المدير العام',
      doc_cr: 'نعم',
      doc_license: 'نعم',
      doc_financials: 'نعم',
      doc_bank: 'نعم',
      doc_tax: 'نعم',
      doc_collateral: 0,
      full_name: 'طارق حسني إبراهيم',
      phone: '0788765432',
      email: 'tareq@alamal-contracting.jo',
      governorate: 'الزرقاء',
      notes: 'تمويل لتنفيذ عطاء حكومي جديد',
      consent: 1
    };

    it('should submit a valid enterprise lead and store document checklist', async () => {
      const res = await request(app)
        .post('/api/leads')
        .send(validEnterpriseLead)
        .expect(201);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.applicant_type, 'منشأة');
      assert.match(res.body.data.ref, /^MP-\d{4}-\d{4}$/);

      // Verify the saved data via GET
      const getRes = await request(app)
        .get(`/api/leads/${res.body.data.ref}`)
        .expect(200);

      assert.strictEqual(getRes.body.data.biz_name, 'شركة الأمل للمقاولات والتوريدات');
      assert.strictEqual(getRes.body.data.biz_amount, 75000);
      assert.strictEqual(getRes.body.data.doc_cr, 1);
      assert.strictEqual(getRes.body.data.doc_license, 1);
      assert.strictEqual(getRes.body.data.doc_collateral, 0);
      assert.deepStrictEqual(getRes.body.data.biz_docs, ['doc_cr', 'doc_license', 'doc_financials', 'doc_bank', 'doc_tax']);
    });
  });

  describe('Validation & Error Handling', () => {
    it('should return 400 Bad Request when applicant_type is missing or invalid', async () => {
      const res = await request(app)
        .post('/api/leads')
        .send({
          full_name: 'سامي خالد',
          phone: '0799999999',
          email: 'sami@test.com'
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'Validation Error');
      assert.ok(res.body.details.some(d => d.field === 'applicant_type'));
    });

    it('should return 400 Bad Request when phone number is malformed (< 9 digits)', async () => {
      const res = await request(app)
        .post('/api/leads')
        .send({
          applicant_type: 'فرد',
          ind_product: 'قرض شخصي',
          ind_amount: 5000,
          ind_tenor: 3,
          ind_income: 600,
          ind_employment: 'قطاع عام',
          full_name: 'علي يوسف',
          phone: '079', // Too short
          email: 'ali@test.com',
          governorate: 'عمّان',
          consent: true
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.details.some(d => d.field === 'phone'));
    });

    it('should return 400 Bad Request when email is invalid', async () => {
      const res = await request(app)
        .post('/api/leads')
        .send({
          applicant_type: 'فرد',
          ind_product: 'قرض شخصي',
          ind_amount: 5000,
          ind_tenor: 3,
          ind_income: 600,
          ind_employment: 'قطاع عام',
          full_name: 'علي يوسف',
          phone: '0791112233',
          email: 'invalid-email-address',
          governorate: 'عمّان',
          consent: true
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.details.some(d => d.field === 'email'));
    });

    it('should return 400 Bad Request when financing amount is zero or negative', async () => {
      const res = await request(app)
        .post('/api/leads')
        .send({
          applicant_type: 'فرد',
          ind_product: 'قرض شخصي',
          ind_amount: -500,
          ind_tenor: 3,
          ind_income: 600,
          ind_employment: 'قطاع عام',
          full_name: 'علي يوسف',
          phone: '0791112233',
          email: 'ali@test.com',
          governorate: 'عمّان',
          consent: true
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.details.some(d => d.field === 'ind_amount'));
    });

    it('should return 400 Bad Request when enterprise lead is missing biz_name', async () => {
      const res = await request(app)
        .post('/api/leads')
        .send({
          applicant_type: 'منشأة',
          biz_sector: 'تجارة',
          biz_purpose: 'سيولة',
          biz_amount: 10000,
          biz_tenor: 2,
          full_name: 'مها خالد',
          phone: '0781234567',
          email: 'maha@test.com',
          governorate: 'إربد',
          consent: true
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.details.some(d => d.field === 'biz_name'));
    });

    it('should return 400 Bad Request when consent is missing/false', async () => {
      const res = await request(app)
        .post('/api/leads')
        .send({
          applicant_type: 'فرد',
          ind_product: 'تمويل سيارة',
          ind_amount: 12000,
          ind_tenor: 4,
          ind_income: 800,
          ind_employment: 'قطاع خاص',
          full_name: 'رامي سعيد',
          phone: '0771234567',
          email: 'rami@test.com',
          governorate: 'عمّان',
          consent: false
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.details.some(d => d.field === 'consent'));
    });

    it('should reject bot honeypot submissions', async () => {
      const res = await request(app)
        .post('/api/leads')
        .send({
          applicant_type: 'فرد',
          ind_product: 'قرض شخصي',
          ind_amount: 5000,
          ind_tenor: 2,
          ind_income: 700,
          ind_employment: 'قطاع خاص',
          full_name: 'Bot User',
          phone: '0799998877',
          email: 'bot@spam.com',
          governorate: 'عمّان',
          consent: true,
          'bot-field': 'spam text filled by bot'
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'Bot submission detected');
    });
  });

  describe('GET /api/leads & GET /api/leads/:ref', () => {
    it('GET /api/leads/:ref should return 404 for non-existent reference', async () => {
      const res = await request(app)
        .get('/api/leads/MP-2608-9999')
        .expect(404);

      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.error.includes('not found'));
    });

    it('GET /api/leads should list created leads with filtering support', async () => {
      // Create individual lead
      await request(app)
        .post('/api/leads')
        .send({
          applicant_type: 'فرد',
          ind_product: 'تمويل سكني',
          ind_amount: 60000,
          ind_tenor: 15,
          ind_income: 1500,
          ind_employment: 'قطاع عام',
          full_name: 'عمر التميمي',
          phone: '0790001122',
          email: 'omar@example.com',
          governorate: 'عمّان',
          consent: true
        })
        .expect(201);

      // Create enterprise lead
      await request(app)
        .post('/api/leads')
        .send({
          applicant_type: 'منشأة',
          biz_name: 'مؤسسة الزيتونة التجارية',
          biz_sector: 'تجارة جملة وتجزئة',
          biz_purpose: 'استيراد بضائع',
          biz_amount: 30000,
          biz_tenor: 2,
          full_name: 'خالد الزعبي',
          phone: '0780003344',
          email: 'khaled@zaitouna.jo',
          governorate: 'إربد',
          consent: true
        })
        .expect(201);

      // Query all leads
      const allRes = await request(app)
        .get('/api/leads')
        .expect(200);

      assert.strictEqual(allRes.body.success, true);
      assert.strictEqual(allRes.body.count, 2);
      assert.strictEqual(allRes.body.total, 2);

      // Query filtered by applicant_type
      const indRes = await request(app)
        .get('/api/leads?applicant_type=فرد')
        .expect(200);

      assert.strictEqual(indRes.body.count, 1);
      assert.strictEqual(indRes.body.data[0].full_name, 'عمر التميمي');
    });
  });
});
