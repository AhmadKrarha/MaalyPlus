const path = require('path');
const fs = require('fs');
const { initDatabase, getDatabase, closeDatabase } = require('../../src/config/database');

const TEST_DB_PATH = path.resolve(__dirname, '../../data/test_leads.db');

/**
 * Initializes a clean SQLite database specifically for test isolation.
 */
function setupTestDb() {
  process.env.DB_PATH = TEST_DB_PATH;
  const db = initDatabase(TEST_DB_PATH);
  // Clear any existing test data
  db.exec('DELETE FROM leads;');
  return db;
}

/**
 * Cleans up the test database file and closes connections.
 */
function teardownTestDb() {
  closeDatabase();
  if (fs.existsSync(TEST_DB_PATH)) {
    try {
      fs.unlinkSync(TEST_DB_PATH);
    } catch (e) {
      // ignore on windows file lock
    }
  }
}

/**
 * Truncates the leads table.
 */
function clearLeadsTable() {
  const db = getDatabase();
  db.exec('DELETE FROM leads;');
}

module.exports = {
  TEST_DB_PATH,
  setupTestDb,
  teardownTestDb,
  clearLeadsTable
};
