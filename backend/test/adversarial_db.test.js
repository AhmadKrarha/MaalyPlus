const { describe, it, before, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const { initDatabase, getDatabase, closeDatabase, isHealthy } = require('../src/config/database');
const { createLead, getLeadByRef, getLeads, updateLeadStatus, generateReferenceNumber } = require('../src/services/leadService');

const ADVERSARIAL_DB_PATH = path.resolve(__dirname, '../data/adversarial_test_leads.db');

describe('Database Integrity Challenger — Adversarial SQLite Persistence & Verification Suite', () => {
  let db;

  before(() => {
    process.env.DB_PATH = ADVERSARIAL_DB_PATH;
    db = initDatabase(ADVERSARIAL_DB_PATH);
  });

  beforeEach(() => {
    db.exec('DELETE FROM leads;');
  });

  after(() => {
    closeDatabase();
    if (fs.existsSync(ADVERSARIAL_DB_PATH)) {
      try {
        fs.unlinkSync(ADVERSARIAL_DB_PATH);
      } catch (e) {
        // file lock on windows
      }
    }
  });

  // =========================================================================
  // 1. Schema Constraints & Enforcement
  // =========================================================================
  describe('1. Schema Constraints & Enforcement', () => {
    it('should enforce UNIQUE constraint on ref column', () => {
      const insertSql = `
        INSERT INTO leads (ref, applicant_type, full_name, phone, email, governorate)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      // Insert first row
      db.prepare(insertSql).run('MP-2608-1111', 'فرد', 'المستخدم الأول', '0791111111', 'user1@test.com', 'عمّان');

      // Attempt duplicate ref insertion
      assert.throws(() => {
        db.prepare(insertSql).run('MP-2608-1111', 'منشأة', 'المستخدم الثاني', '0792222222', 'user2@test.com', 'إربد');
      }, (err) => {
        return err.message.includes('UNIQUE constraint failed') || err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === 'SQLITE_CONSTRAINT';
      }, 'Inserting duplicate ref must throw SQLite UNIQUE constraint violation');
    });

    it('should enforce CHECK constraint on applicant_type', () => {
      const insertSql = `
        INSERT INTO leads (ref, applicant_type, full_name, phone, email, governorate)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      assert.throws(() => {
        db.prepare(insertSql).run('MP-2608-2222', 'invalid_type', 'اسم تجريبي', '0793333333', 'test@test.com', 'عمّان');
      }, (err) => {
        return err.message.includes('CHECK constraint failed') || err.code === 'SQLITE_CONSTRAINT_CHECK' || err.code === 'SQLITE_CONSTRAINT';
      }, 'Inserting invalid applicant_type must throw CHECK constraint violation');
    });

    it('should enforce CHECK constraint on status column', () => {
      const insertSql = `
        INSERT INTO leads (ref, applicant_type, status, full_name, phone, email, governorate)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      assert.throws(() => {
        db.prepare(insertSql).run('MP-2608-3333', 'فرد', 'invalid_status', 'اسم تجريبي', '0794444444', 'test@test.com', 'عمّان');
      }, (err) => {
        return err.message.includes('CHECK constraint failed') || err.code === 'SQLITE_CONSTRAINT_CHECK' || err.code === 'SQLITE_CONSTRAINT';
      }, 'Inserting invalid status must throw CHECK constraint violation');
    });

    it('should enforce NOT NULL constraints on mandatory contact fields', () => {
      const insertSql = `
        INSERT INTO leads (ref, applicant_type, full_name, phone, email, governorate)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      // Missing full_name (NULL)
      assert.throws(() => {
        db.prepare(insertSql).run('MP-2608-4441', 'فرد', null, '0795555555', 'test@test.com', 'عمّان');
      }, /NOT NULL constraint failed|SQLITE_CONSTRAINT_NOTNULL|SQLITE_CONSTRAINT/);

      // Missing phone (NULL)
      assert.throws(() => {
        db.prepare(insertSql).run('MP-2608-4442', 'فرد', 'اسم تجريبي', null, 'test@test.com', 'عمّان');
      }, /NOT NULL constraint failed|SQLITE_CONSTRAINT_NOTNULL|SQLITE_CONSTRAINT/);

      // Missing email (NULL)
      assert.throws(() => {
        db.prepare(insertSql).run('MP-2608-4443', 'فرد', 'اسم تجريبي', '0795555555', null, 'عمّان');
      }, /NOT NULL constraint failed|SQLITE_CONSTRAINT_NOTNULL|SQLITE_CONSTRAINT/);

      // Missing governorate (NULL)
      assert.throws(() => {
        db.prepare(insertSql).run('MP-2608-4444', 'فرد', 'اسم تجريبي', '0795555555', 'test@test.com', null);
      }, /NOT NULL constraint failed|SQLITE_CONSTRAINT_NOTNULL|SQLITE_CONSTRAINT/);
    });

    it('should populate default values accurately on sparse insertion', () => {
      db.prepare(`
        INSERT INTO leads (ref, applicant_type, full_name, phone, email, governorate)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('MP-2608-5555', 'فرد', 'تست افتراضي', '0796666666', 'defaults@test.com', 'الزرقاء');

      const row = db.prepare('SELECT * FROM leads WHERE ref = ?').get('MP-2608-5555');
      assert.ok(row);
      assert.strictEqual(row.status, 'pending', 'Default status must be "pending"');
      assert.strictEqual(row.consent, 1, 'Default consent must be 1');
      assert.strictEqual(row.ind_sharia, 'لا يهمّني', 'Default ind_sharia must be "لا يهمّني"');
      assert.strictEqual(row.ind_obligations, 0, 'Default ind_obligations must be 0');
      assert.strictEqual(row.doc_cr, 0, 'Default doc_cr must be 0');
      assert.strictEqual(row.doc_license, 0, 'Default doc_license must be 0');
      assert.strictEqual(row.doc_financials, 0, 'Default doc_financials must be 0');
      assert.strictEqual(row.doc_bank, 0, 'Default doc_bank must be 0');
      assert.strictEqual(row.doc_tax, 0, 'Default doc_tax must be 0');
      assert.strictEqual(row.doc_collateral, 0, 'Default doc_collateral must be 0');
      assert.strictEqual(row.est_rate_used, 7.75, 'Default est_rate_used must be 7.75');
      assert.ok(row.created_at, 'created_at timestamp must be automatically populated');
      assert.ok(row.updated_at, 'updated_at timestamp must be automatically populated');
    });
  });

  // =========================================================================
  // 2. Persistence Across Connection Resets & Engine Restarts
  // =========================================================================
  describe('2. Data Survival Across Connection Resets', () => {
    it('should persist leads accurately when database connection is closed and reopened', () => {
      // 1. Insert 3 distinct leads
      const lead1 = createLead({
        applicant_type: 'فرد',
        full_name: 'سامي عبد الرحمن',
        phone: '0791112233',
        email: 'sami.abdel@example.com',
        governorate: 'عمّان',
        ind_product: 'تمويل سكني',
        ind_amount: 80000,
        ind_tenor: 15,
        ind_income: 1800,
        ind_employment: 'قطاع عام',
        consent: 1
      });

      const lead2 = createLead({
        applicant_type: 'منشأة',
        biz_name: 'شركة المدار الهندسية',
        biz_legal: 'ذات مسؤولية محدودة',
        biz_sector: 'استشارات هندسية',
        biz_purpose: 'شراء معدات مساحة',
        biz_amount: 35000,
        biz_tenor: 3,
        full_name: 'م. حسام العلي',
        phone: '0788887766',
        email: 'hussam@almadar.jo',
        governorate: 'إربد',
        doc_cr: 1,
        doc_license: 1,
        consent: 1
      });

      assert.ok(lead1.ref);
      assert.ok(lead2.ref);

      // Verify records exist in memory before reset
      let preResetCount = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
      assert.strictEqual(preResetCount, 2);

      // 2. Perform connection reset (Simulate application reboot / connection teardown)
      closeDatabase();

      // Verify health check returns false or re-initializes
      // 3. Re-initialize database pointing to exact same file path
      const reconnectedDb = initDatabase(ADVERSARIAL_DB_PATH);
      assert.ok(isHealthy(), 'Database should be healthy after reconnection');

      // 4. Verify count and data integrity after reset
      const postResetCount = reconnectedDb.prepare('SELECT COUNT(*) as count FROM leads').get().count;
      assert.strictEqual(postResetCount, 2, 'All rows must survive connection reset without data loss');

      const retrieved1 = reconnectedDb.prepare('SELECT * FROM leads WHERE ref = ?').get(lead1.ref);
      assert.ok(retrieved1, 'Lead 1 must be retrievable post-reset');
      assert.strictEqual(retrieved1.full_name, 'سامي عبد الرحمن');
      assert.strictEqual(retrieved1.ind_amount, 80000);
      assert.strictEqual(retrieved1.ind_tenor, 15);
      assert.strictEqual(retrieved1.applicant_type, 'فرد');

      const retrieved2 = reconnectedDb.prepare('SELECT * FROM leads WHERE ref = ?').get(lead2.ref);
      assert.ok(retrieved2, 'Lead 2 must be retrievable post-reset');
      assert.strictEqual(retrieved2.biz_name, 'شركة المدار الهندسية');
      assert.strictEqual(retrieved2.biz_amount, 35000);
      assert.strictEqual(retrieved2.doc_cr, 1);
      assert.strictEqual(retrieved2.doc_license, 1);

      // Update local db handle for subsequent tests
      db = reconnectedDb;
    });
  });

  // =========================================================================
  // 3. Transaction Integrity & Rollback Atomicity
  // =========================================================================
  describe('3. Transaction Integrity & Rollback Atomicity', () => {
    it('should completely roll back all changes when an error occurs inside a transaction', () => {
      const initialCount = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;

      const insertStmt = db.prepare(`
        INSERT INTO leads (ref, applicant_type, full_name, phone, email, governorate)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // Execute transaction with deliberate error halfway through
      try {
        db.exec('BEGIN TRANSACTION;');
        insertStmt.run('MP-2608-TX01', 'فرد', 'عملية 1 ناجحة', '0790000001', 'tx1@test.com', 'عمّان');
        insertStmt.run('MP-2608-TX02', 'فرد', 'عملية 2 ناجحة', '0790000002', 'tx2@test.com', 'عمّان');

        // Deliberate constraint violation: duplicate ref MP-2608-TX01
        insertStmt.run('MP-2608-TX01', 'فرد', 'عملية 3 فاشلة', '0790000003', 'tx3@test.com', 'عمّان');
        db.exec('COMMIT;');
      } catch (err) {
        db.exec('ROLLBACK;');
      }

      // Verify that NO partial rows from the aborted transaction were committed
      const finalCount = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
      assert.strictEqual(finalCount, initialCount, 'Database must return to initial state on transaction rollback');

      const tx1 = db.prepare('SELECT * FROM leads WHERE ref = ?').get('MP-2608-TX01');
      const tx2 = db.prepare('SELECT * FROM leads WHERE ref = ?').get('MP-2608-TX02');
      assert.strictEqual(tx1, undefined, 'Aborted row 1 must not exist');
      assert.strictEqual(tx2, undefined, 'Aborted row 2 must not exist');
    });

    it('should successfully commit all changes when transaction completes without errors', () => {
      const insertStmt = db.prepare(`
        INSERT INTO leads (ref, applicant_type, full_name, phone, email, governorate)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      db.exec('BEGIN TRANSACTION;');
      insertStmt.run('MP-2608-TX10', 'فرد', 'عملية ملتزمة 1', '0790000010', 'tx10@test.com', 'عمّان');
      insertStmt.run('MP-2608-TX11', 'منشأة', 'عملية ملتزمة 2', '0790000011', 'tx11@test.com', 'إربد');
      db.exec('COMMIT;');

      const row1 = db.prepare('SELECT * FROM leads WHERE ref = ?').get('MP-2608-TX10');
      const row2 = db.prepare('SELECT * FROM leads WHERE ref = ?').get('MP-2608-TX11');

      assert.ok(row1);
      assert.ok(row2);
      assert.strictEqual(row1.full_name, 'عملية ملتزمة 1');
      assert.strictEqual(row2.full_name, 'عملية ملتزمة 2');
    });
  });

  // =========================================================================
  // 4. Query Consistency, Filtering, and Pagination
  // =========================================================================
  describe('4. Query Consistency, Filtering, and Pagination', () => {
    beforeEach(() => {
      // Seed diverse leads
      const statuses = ['pending', 'under_review', 'matched', 'contacted', 'closed'];
      for (let i = 1; i <= 10; i++) {
        const isInd = i % 2 !== 0;
        const status = statuses[(i - 1) % statuses.length];
        const ref = `MP-2608-Q${String(i).padStart(3, '0')}`;

        db.prepare(`
          INSERT INTO leads (
            ref, applicant_type, status, full_name, phone, email, governorate,
            ind_amount, biz_amount, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
        `).run(
          ref,
          isInd ? 'فرد' : 'منشأة',
          status,
          `مستخدم اختبار ${i}`,
          `07900000${String(i).padStart(2, '0')}`,
          `user${i}@query-test.com`,
          i % 3 === 0 ? 'إربد' : 'عمّان',
          isInd ? i * 1000 : null,
          !isInd ? i * 5000 : null,
          `-${10 - i} minutes`
        );
      }
    });

    it('should query all leads with accurate total and default ordering by id DESC', () => {
      const res = getLeads({ limit: 50 });
      assert.strictEqual(res.total, 10);
      assert.strictEqual(res.count, 10);
      assert.strictEqual(res.data[0].ref, 'MP-2608-Q010', 'Newest record must be first (id DESC)');
      assert.strictEqual(res.data[9].ref, 'MP-2608-Q001', 'Oldest record must be last');
    });

    it('should correctly filter leads by applicant_type', () => {
      const indRes = getLeads({ applicant_type: 'فرد' });
      assert.strictEqual(indRes.total, 5);
      assert.strictEqual(indRes.count, 5);
      assert.ok(indRes.data.every(r => r.applicant_type === 'فرد'));

      const bizRes = getLeads({ applicant_type: 'منشأة' });
      assert.strictEqual(bizRes.total, 5);
      assert.strictEqual(bizRes.count, 5);
      assert.ok(bizRes.data.every(r => r.applicant_type === 'منشأة'));
    });

    it('should correctly filter leads by status', () => {
      const underReviewRes = getLeads({ status: 'under_review' });
      assert.strictEqual(underReviewRes.total, 2); // items 2 and 7
      assert.ok(underReviewRes.data.every(r => r.status === 'under_review'));
    });

    it('should correctly combine filters (status + applicant_type)', () => {
      // items with status 'pending' (items 1 and 6): item 1 is فرد, item 6 is منشأة
      const pendingIndRes = getLeads({ status: 'pending', applicant_type: 'فرد' });
      assert.strictEqual(pendingIndRes.total, 1);
      assert.strictEqual(pendingIndRes.data[0].ref, 'MP-2608-Q001');
    });

    it('should correctly handle pagination (limit and offset)', () => {
      const page1 = getLeads({ limit: 3, offset: 0 });
      assert.strictEqual(page1.count, 3);
      assert.strictEqual(page1.total, 10);
      assert.strictEqual(page1.data[0].ref, 'MP-2608-Q010');
      assert.strictEqual(page1.data[1].ref, 'MP-2608-Q009');
      assert.strictEqual(page1.data[2].ref, 'MP-2608-Q008');

      const page2 = getLeads({ limit: 3, offset: 3 });
      assert.strictEqual(page2.count, 3);
      assert.strictEqual(page2.data[0].ref, 'MP-2608-Q007');
      assert.strictEqual(page2.data[1].ref, 'MP-2608-Q006');
      assert.strictEqual(page2.data[2].ref, 'MP-2608-Q005');

      const page4 = getLeads({ limit: 3, offset: 9 });
      assert.strictEqual(page4.count, 1);
      assert.strictEqual(page4.data[0].ref, 'MP-2608-Q001');
    });
  });

  // =========================================================================
  // 5. Unicode, Arabic Diacritics & Complex Payload Round-Trip
  // =========================================================================
  describe('5. Unicode & Payload Serialization Fidelity', () => {
    it('should preserve complex Arabic Unicode characters, diacritics, and symbols', () => {
      const complexLead = {
        applicant_type: 'فرد',
        full_name: 'مُحَمَّد عَبْدُ اللهِ آلُ سَعُود',
        phone: '0799887766',
        email: 'mohammed.special@example.com',
        governorate: 'عمّان — الدوار السابع، بالقرب من مبنى الملكية',
        ind_product: 'تمويل شخصي / إسلامي «مرابحة»',
        ind_amount: 12500.75,
        ind_tenor: 4,
        ind_income: 1100.50,
        ind_obligations: 150.25,
        ind_employment: 'القطاع العسكري & الأجهزة الأمنية',
        notes: 'ملاحظة خاصة: "يرجى عدم الاتصال وقت الظهيرة!" — تفضيل العروض ذات نسبة فائدة < 6% & متوافقة 100% 🎯',
        consent: 1
      };

      const created = createLead(complexLead, {
        ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0'
      });

      const retrieved = getLeadByRef(created.ref);
      assert.ok(retrieved);
      assert.strictEqual(retrieved.full_name, 'مُحَمَّد عَبْدُ اللهِ آلُ سَعُود');
      assert.strictEqual(retrieved.governorate, 'عمّان — الدوار السابع، بالقرب من مبنى الملكية');
      assert.strictEqual(retrieved.ind_product, 'تمويل شخصي / إسلامي «مرابحة»');
      assert.strictEqual(retrieved.ind_amount, 12500.75);
      assert.strictEqual(retrieved.ind_income, 1100.50);
      assert.strictEqual(retrieved.notes, 'ملاحظة خاصة: "يرجى عدم الاتصال وقت الظهيرة!" — تفضيل العروض ذات نسبة فائدة < 6% & متوافقة 100% 🎯');
      assert.strictEqual(retrieved.ip_address, '2001:0db8:85a3:0000:0000:8a2e:0370:7334');

      // Verify payload_json string round-trip
      const parsedAudit = JSON.parse(retrieved.payload_json);
      assert.strictEqual(parsedAudit.full_name, 'مُحَمَّد عَبْدُ اللهِ آلُ سَعُود');
      assert.strictEqual(parsedAudit.ind_amount, 12500.75);
    });

    it('should accurately serialize, store, and deserialize enterprise checklist JSON array', () => {
      const enterpriseLead = {
        applicant_type: 'منشأة',
        biz_name: 'شركة التقنية الحديثة للتجارة العامة ذ.م.م',
        biz_legal: 'شركة ذات مسؤولية محدودة',
        biz_sector: 'تجارة إلكترونية وخدمات لوجستية',
        biz_amount: 50000,
        biz_tenor: 3,
        doc_cr: 1,
        doc_license: 1,
        doc_financials: 1,
        doc_bank: 1,
        doc_tax: 0,
        doc_collateral: 1,
        full_name: 'علاء الدين القاسم',
        phone: '0777123456',
        email: 'alaa@modern-tech.jo',
        governorate: 'عمّان',
        consent: 1
      };

      const created = createLead(enterpriseLead);
      const retrieved = getLeadByRef(created.ref);

      assert.ok(retrieved);
      assert.strictEqual(retrieved.doc_cr, 1);
      assert.strictEqual(retrieved.doc_license, 1);
      assert.strictEqual(retrieved.doc_financials, 1);
      assert.strictEqual(retrieved.doc_bank, 1);
      assert.strictEqual(retrieved.doc_tax, 0);
      assert.strictEqual(retrieved.doc_collateral, 1);

      assert.deepStrictEqual(retrieved.biz_docs, ['doc_cr', 'doc_license', 'doc_financials', 'doc_bank', 'doc_collateral']);
    });
  });

  // =========================================================================
  // 6. SQL Injection Resilience
  // =========================================================================
  describe('6. SQL Injection Resilience & Prepared Statement Verification', () => {
    it('should resist SQL injection attempts in getLeadByRef parameter', () => {
      // Attempt SQL injection via parameter
      const maliciousRef = "MP-2608-0001' OR '1'='1";
      const result = getLeadByRef(maliciousRef);
      assert.strictEqual(result, null, 'SQL injection attempt must not return any unauthorized records');
    });

    it('should resist SQL injection attempts in filter parameters', () => {
      const maliciousStatus = "' OR 1=1 --";
      const res = getLeads({ status: maliciousStatus });
      assert.strictEqual(res.total, 0, 'Injected SQL status must match literally 0 records');
      assert.strictEqual(res.count, 0);
    });

    it('should safely store SQL attack payloads as literal text without executing destructive SQL', () => {
      const injectionLead = {
        applicant_type: 'فرد',
        full_name: "Robert'); DROP TABLE leads; --",
        phone: "0790000000' OR '1'='1",
        email: "injection@test.com'--",
        governorate: "عمّان'; DELETE FROM leads WHERE 'a'='a",
        ind_product: "قرض' UNION SELECT * FROM leads --",
        ind_amount: 1000,
        ind_tenor: 1,
        ind_income: 500,
        ind_employment: "قطاع خاص",
        notes: "'); DROP TABLE leads; COMMIT; --",
        consent: 1
      };

      const created = createLead(injectionLead);
      assert.ok(created.ref);

      // Verify table still exists and integrity check passes
      const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='leads'").get();
      assert.ok(tableCheck, 'leads table must NOT be dropped');

      const retrieved = getLeadByRef(created.ref);
      assert.ok(retrieved);
      assert.strictEqual(retrieved.full_name, "Robert'); DROP TABLE leads; --");
      assert.strictEqual(retrieved.notes, "'); DROP TABLE leads; COMMIT; --");
    });
  });

  // =========================================================================
  // 7. High-Volume Concurrent Insertion & Collision Resilience
  // =========================================================================
  describe('7. High-Volume Generation & Reference Collision Resilience', () => {
    it('should generate 50 strictly unique references and insert 50 rows without collision', () => {
      const refs = new Set();
      const countToInsert = 50;

      for (let i = 0; i < countToInsert; i++) {
        const lead = createLead({
          applicant_type: 'فرد',
          full_name: `مستخدم رقم ${i + 1}`,
          phone: `079100${String(i).padStart(4, '0')}`,
          email: `bulk_${i}@example.com`,
          governorate: 'عمّان',
          ind_product: 'قرض شخصي',
          ind_amount: 5000 + i * 100,
          ind_tenor: 3,
          ind_income: 800,
          ind_employment: 'قطاع خاص',
          consent: 1
        });

        assert.match(lead.ref, /^MP-\d{4}-\d{4}$/, 'Reference format must strictly adhere to MP-YYMM-XXXX');
        assert.ok(!refs.has(lead.ref), `Reference collision detected on ${lead.ref}`);
        refs.add(lead.ref);
      }

      assert.strictEqual(refs.size, countToInsert, 'All 50 reference numbers must be distinct');

      const dbCount = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
      assert.strictEqual(dbCount, countToInsert, 'Database row count must equal exactly 50');
    });
  });

  // =========================================================================
  // 8. Lead Status Lifecycle & Timestamp Mutation
  // =========================================================================
  describe('8. Status Lifecycle & Timestamp Mutation', () => {
    it('should transition lead status through entire workflow and update updated_at', async () => {
      const created = createLead({
        applicant_type: 'فرد',
        full_name: 'يحيى عبد الكريم',
        phone: '0798765432',
        email: 'yahya@test.com',
        governorate: 'عمّان',
        ind_product: 'تمويل شخصي',
        ind_amount: 10000,
        ind_tenor: 3,
        ind_income: 900,
        ind_employment: 'قطاع خاص',
        consent: 1
      });

      assert.strictEqual(created.status, 'pending');
      const initialCreatedAt = created.created_at;
      const initialUpdatedAt = created.updated_at;

      // Status sequence
      const workflow = ['under_review', 'matched', 'contacted', 'closed'];

      for (const nextStatus of workflow) {
        // Small delay to verify timestamp progression
        const updated = updateLeadStatus(created.ref, nextStatus);
        assert.ok(updated, `Status update to ${nextStatus} must succeed`);
        assert.strictEqual(updated.status, nextStatus);
        assert.strictEqual(updated.created_at, initialCreatedAt, 'created_at must never change on status update');
      }

      // Verify non-existent reference update returns null
      const nonExistent = updateLeadStatus('MP-9999-0000', 'closed');
      assert.strictEqual(nonExistent, null);
    });
  });

  // =========================================================================
  // 9. Database File Integrity & Catalog Pragma
  // =========================================================================
  describe('9. Database File Integrity & Catalog Pragma', () => {
    it('should verify database integrity check passes without errors (PRAGMA integrity_check)', () => {
      const result = db.prepare('PRAGMA integrity_check;').get();
      assert.strictEqual(result.integrity_check, 'ok', 'PRAGMA integrity_check must return "ok"');
    });

    it('should verify WAL journal mode is active', () => {
      const result = db.prepare('PRAGMA journal_mode;').get();
      assert.strictEqual(result.journal_mode.toLowerCase(), 'wal', 'PRAGMA journal_mode must be WAL');
    });

    it('should verify foreign keys are enabled', () => {
      const result = db.prepare('PRAGMA foreign_keys;').get();
      assert.strictEqual(result.foreign_keys, 1, 'PRAGMA foreign_keys must be 1');
    });
  });
});
