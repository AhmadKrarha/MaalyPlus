const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');
const { setupTestDb, teardownTestDb } = require('./helpers/testDb');

describe('Health & Root API Tests', () => {
  before(() => {
    setupTestDb();
  });

  after(() => {
    teardownTestDb();
  });

  it('GET /api/health should return 200 OK and connected database status', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.database, 'connected');
    assert.ok(res.body.timestamp);
    assert.ok(new Date(res.body.timestamp).getTime() > 0);
  });

  it('GET / should return 200 with API status and endpoint map', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);

    assert.strictEqual(res.body.name, 'MaalyPlus Backend API');
    assert.strictEqual(res.body.status, 'running');
    assert.ok(res.body.endpoints);
  });

  it('GET /api/nonexistent-route should return 404', async () => {
    const res = await request(app)
      .get('/api/nonexistent-route')
      .expect(404);

    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error);
  });
});
