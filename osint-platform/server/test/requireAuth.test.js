// Requires jsonwebtoken (a real dependency of the app) to be installed —
// run via `npm test` after `npm install`, not runnable from pure node built-ins.
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-do-not-use-in-prod';

const { requireAuth } = await import('../src/middleware/requireAuth.js');

function mockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

describe('requireAuth', () => {
  test('rejects requests with no Authorization header', () => {
    const req = { headers: {} };
    const res = mockRes();
    let nextCalled = false;
    requireAuth(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });

  test('rejects a malformed/invalid token', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } };
    const res = mockRes();
    let nextCalled = false;
    requireAuth(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });

  test('rejects an expired token', () => {
    const token = jwt.sign({ sub: 'user-123' }, process.env.JWT_SECRET, { expiresIn: -10 });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    let nextCalled = false;
    requireAuth(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });

  test('accepts a valid token and sets req.userId', () => {
    const token = jwt.sign({ sub: 'user-123' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    let nextCalled = false;
    requireAuth(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
    assert.equal(req.userId, 'user-123');
  });
});
