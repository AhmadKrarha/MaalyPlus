const fs = require('fs');
const path = require('path');

let activeDb = null;
let currentDbPath = null;

/**
 * Creates or gets the SQLite database connection and initializes the schema.
 * @param {string} [customPath] Optional custom database file path
 * @returns {object} Database instance wrapper
 */
function initDatabase(customPath) {
  const dbPath = customPath || process.env.DB_PATH || path.resolve(__dirname, '../../data/leads.db');
  
  // If already initialized for this path, return active instance
  if (activeDb && currentDbPath === dbPath) {
    return activeDb;
  }

  // Ensure target directory exists
  const dbDir = path.dirname(dbPath);
  if (dbPath !== ':memory:' && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  let db;
  let driver = 'better-sqlite3';

  try {
    const BetterSqlite3 = require('better-sqlite3');
    db = new BetterSqlite3(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  } catch (err) {
    // Fallback to Node.js native SQLite (node:sqlite DatabaseSync)
    try {
      const { DatabaseSync } = require('node:sqlite');
      const nativeDb = new DatabaseSync(dbPath);
      driver = 'node:sqlite';

      // Provide unified wrapper over native DatabaseSync
      db = {
        exec: (sql) => nativeDb.exec(sql),
        prepare: (sql) => {
          const stmt = nativeDb.prepare(sql);
          return {
            run: (...params) => {
              const res = stmt.run(...params);
              return {
                changes: res ? res.changes : 0,
                lastInsertRowid: res ? res.lastInsertRowid : null
              };
            },
            get: (...params) => stmt.get(...params),
            all: (...params) => stmt.all(...params)
          };
        },
        pragma: (pragmaStr) => nativeDb.exec(`PRAGMA ${pragmaStr};`),
        close: () => nativeDb.close()
      };
    } catch (fallbackErr) {
      throw new Error(`Failed to initialize SQLite database with better-sqlite3 and node:sqlite: ${err.message} / ${fallbackErr.message}`);
    }
  }

  // Create tables and indexes
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref TEXT UNIQUE NOT NULL,
      applicant_type TEXT NOT NULL CHECK (applicant_type IN ('فرد', 'منشأة', 'individual', 'business')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'matched', 'contacted', 'closed')),
      
      -- Common Contact Information
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      governorate TEXT NOT NULL,
      contact_role TEXT,
      notes TEXT,
      consent INTEGER NOT NULL DEFAULT 1,
      
      -- Individual Track Fields
      ind_product TEXT,
      ind_amount REAL,
      ind_tenor INTEGER,
      ind_sharia TEXT DEFAULT 'لا يهمّني',
      ind_income REAL,
      ind_obligations REAL DEFAULT 0,
      ind_employment TEXT,
      ind_job_years TEXT,
      ind_transfer TEXT,
      
      -- Enterprise Track Fields
      biz_name TEXT,
      biz_legal TEXT,
      biz_sector TEXT,
      biz_age TEXT,
      biz_employees TEXT,
      biz_revenue TEXT,
      biz_purpose TEXT,
      biz_amount REAL,
      biz_tenor INTEGER,
      biz_docs_json TEXT,
      biz_sharia TEXT DEFAULT 'لا يهمّني',
      
      -- Enterprise Document Checklist Flags (1 = Yes, 0 = No)
      doc_cr INTEGER DEFAULT 0,
      doc_license INTEGER DEFAULT 0,
      doc_financials INTEGER DEFAULT 0,
      doc_bank INTEGER DEFAULT 0,
      doc_tax INTEGER DEFAULT 0,
      doc_collateral INTEGER DEFAULT 0,
      
      -- Metadata & Technical Audit
      est_rate_used REAL DEFAULT 7.75,
      ip_address TEXT,
      user_agent TEXT,
      payload_json TEXT,
      
      -- Timestamps
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_leads_ref ON leads(ref);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_applicant_type ON leads(applicant_type);
    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  activeDb = db;
  currentDbPath = dbPath;

  return activeDb;
}

/**
 * Returns the current active database instance or initializes the default one.
 * @returns {object}
 */
function getDatabase() {
  if (!activeDb) {
    return initDatabase();
  }
  return activeDb;
}

/**
 * Checks database health by executing a simple ping query.
 * @returns {boolean}
 */
function isHealthy() {
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT 1 as ping').get();
    return !!result && (result.ping === 1 || result.ping === 1n);
  } catch (err) {
    return false;
  }
}

/**
 * Closes the active database connection.
 */
function closeDatabase() {
  if (activeDb) {
    try {
      activeDb.close();
    } catch (e) {
      // ignore
    }
    activeDb = null;
    currentDbPath = null;
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  isHealthy,
  closeDatabase
};
