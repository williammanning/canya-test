import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const TEST_PORT = 3099;
const BASE = `http://localhost:${TEST_PORT}`;
const TEST_DATA_DIR = path.join(__dirname, 'data');
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const TEST_SECRET = 'test-secret-key-for-api-tests';

let server;
let adminToken;
let userToken;
let adminUserId;
let regularUserId;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function api(method, urlPath, body, token) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);
  return fetch(`${BASE}${urlPath}`, opts);
}

async function waitForServer(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(BASE);
      if (res.status < 500) return;
    } catch {}
    await sleep(200);
  }
  throw new Error('Server did not start within 6 seconds');
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

before(async () => {
  // Reset isolated test data from fixtures
  if (fs.existsSync(TEST_DATA_DIR)) fs.rmSync(TEST_DATA_DIR, { recursive: true });
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
  for (const file of fs.readdirSync(FIXTURES_DIR)) {
    fs.copyFileSync(path.join(FIXTURES_DIR, file), path.join(TEST_DATA_DIR, file));
  }

  server = spawn('node', ['server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(TEST_PORT), SECRET_KEY: TEST_SECRET, DATA_DIR: TEST_DATA_DIR },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  server.stderr.on('data', d => process.stderr.write(d));

  await waitForServer();

  // Obtain tokens for use across all tests
  const adminRes = await api('POST', '/api/auth/login', { email: 'admin@canya.com', password: 'admin123' });
  const adminData = await adminRes.json();
  adminToken = adminData.token;
  adminUserId = adminData.user?.id;

  const userRes = await api('POST', '/api/auth/login', { email: 'sjohnson@canya.com', password: 'admin123' });
  const userData = await userRes.json();
  userToken = userData.token;
  regularUserId = userData.user?.id;
});

after(() => server?.kill());

// ── Auth ──────────────────────────────────────────────────────────────────────

describe('Auth', () => {
  test('valid credentials return token and user', async () => {
    const res = await api('POST', '/api/auth/login', { email: 'admin@canya.com', password: 'admin123' });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token, 'token should be present');
    assert.equal(data.user.email, 'admin@canya.com');
    assert.equal(data.user.role, 'admin');
  });

  test('wrong password returns 401', async () => {
    const res = await api('POST', '/api/auth/login', { email: 'admin@canya.com', password: 'wrongpassword' });
    assert.equal(res.status, 401);
  });

  test('unknown email returns 401', async () => {
    const res = await api('POST', '/api/auth/login', { email: 'nobody@example.com', password: 'admin123' });
    assert.equal(res.status, 401);
  });

  test('missing password returns 400', async () => {
    const res = await api('POST', '/api/auth/login', { email: 'admin@canya.com' });
    assert.equal(res.status, 400);
  });

  test('verify valid token returns user data', async () => {
    const res = await api('GET', '/api/auth/verify', null, adminToken);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.valid, true);
    assert.ok(data.user.email);
  });

  test('verify with bad token returns 401', async () => {
    const res = await api('GET', '/api/auth/verify', null, 'bad.token.here');
    assert.equal(res.status, 401);
  });

  test('verify with no token returns 401', async () => {
    const res = await fetch(`${BASE}/api/auth/verify`);
    assert.equal(res.status, 401);
  });
});

// ── Public API ────────────────────────────────────────────────────────────────

describe('Public API', () => {
  test('GET /api/public/services returns non-empty array', async () => {
    const res = await api('GET', '/api/public/services');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data) && data.length > 0);
  });

  test('GET /api/public/links returns non-empty array', async () => {
    const res = await api('GET', '/api/public/links');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data) && data.length > 0);
  });

  test('GET /api/public/members returns array', async () => {
    const res = await api('GET', '/api/public/members');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
  });
});

// ── User Management ───────────────────────────────────────────────────────────

describe('User Management', () => {
  test('admin can list all users', async () => {
    const res = await api('GET', '/api/users', null, adminToken);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data) && data.length > 0);
    assert.ok(data.every(u => !u.password), 'passwords must not be returned');
  });

  test('non-admin cannot list users', async () => {
    const res = await api('GET', '/api/users', null, userToken);
    assert.equal(res.status, 403);
  });

  test('unauthenticated request cannot list users', async () => {
    const res = await api('GET', '/api/users');
    assert.equal(res.status, 401);
  });

  test('admin can create then delete a user', async () => {
    const createRes = await api('POST', '/api/users', {
      email: 'temp@test.com',
      password: 'TempPass123',
      name: 'Temp User'
    }, adminToken);
    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    assert.ok(created.id);
    assert.equal(created.email, 'temp@test.com');
    assert.ok(!created.password, 'password must not be returned on create');

    const delRes = await api('DELETE', `/api/users/${created.id}`, null, adminToken);
    assert.equal(delRes.status, 200);
  });

  test('non-admin cannot create users', async () => {
    const res = await api('POST', '/api/users', {
      email: 'sneaky@test.com',
      password: 'Pass123',
      name: 'Sneaky'
    }, userToken);
    assert.equal(res.status, 403);
  });

  test('user can update their own name', async () => {
    const res = await api('PUT', `/api/users/${regularUserId}`, { name: 'Sarah J.' }, userToken);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.name, 'Sarah J.');
  });

  test('user cannot update another user profile', async () => {
    const res = await api('PUT', `/api/users/${adminUserId}`, { name: 'Hacked' }, userToken);
    assert.equal(res.status, 403);
  });
});

// ── Password Change Security (Vuln 2 fix) ────────────────────────────────────

describe('Password Change Security', () => {
  test('missing currentPassword returns 400', async () => {
    const res = await api('PUT', `/api/users/${regularUserId}`, {
      password: 'NewPass456!'
    }, userToken);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /current password/i);
  });

  test('wrong currentPassword returns 403', async () => {
    const res = await api('PUT', `/api/users/${regularUserId}`, {
      password: 'NewPass456!',
      currentPassword: 'notthepassword'
    }, userToken);
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.match(data.error, /incorrect/i);
  });

  test('correct currentPassword allows change', async () => {
    const res = await api('PUT', `/api/users/${regularUserId}`, {
      password: 'NewPass456!',
      currentPassword: 'admin123'
    }, userToken);
    assert.equal(res.status, 200);
  });

  test('admin can reset any user password without currentPassword', async () => {
    // Admin-initiated resets should not require knowledge of the old password
    const res = await api('PUT', `/api/users/${regularUserId}`, {
      password: 'AdminReset789!'
    }, adminToken);
    assert.equal(res.status, 200);
  });
});

// ── Link Management ───────────────────────────────────────────────────────────

describe('Link Management', () => {
  let linkId;

  test('admin can create a link', async () => {
    const res = await api('POST', '/api/links', {
      name: 'Test Org',
      url: 'https://example.org',
      description: 'A test link'
    }, adminToken);
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.name, 'Test Org');
    assert.ok(data.id);
    linkId = data.id;
  });

  test('link creation rejects javascript: protocol URL', async () => {
    const res = await api('POST', '/api/links', {
      name: 'Bad Link',
      url: 'javascript:alert(1)'
    }, adminToken);
    assert.equal(res.status, 400);
  });

  test('link creation requires name and url', async () => {
    const res = await api('POST', '/api/links', { name: 'No URL' }, adminToken);
    assert.equal(res.status, 400);
  });

  test('admin can update a link', async () => {
    const res = await api('PUT', `/api/links/${linkId}`, { name: 'Updated Org' }, adminToken);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.name, 'Updated Org');
  });

  test('non-admin cannot create links', async () => {
    const res = await api('POST', '/api/links', {
      name: 'Unauthorized',
      url: 'https://example.com'
    }, userToken);
    assert.equal(res.status, 403);
  });

  test('non-admin cannot delete links', async () => {
    const res = await api('DELETE', `/api/links/${linkId}`, null, userToken);
    assert.equal(res.status, 403);
  });

  test('admin can delete a link', async () => {
    const res = await api('DELETE', `/api/links/${linkId}`, null, adminToken);
    assert.equal(res.status, 200);
  });
});

// ── Service Management ────────────────────────────────────────────────────────

describe('Service Management', () => {
  let serviceId;

  test('admin can create a service', async () => {
    const res = await api('POST', '/api/services', {
      name: 'Test Service',
      description: 'A test service',
      icon: '🧪'
    }, adminToken);
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.name, 'Test Service');
    assert.ok(data.id);
    serviceId = data.id;
  });

  test('admin can update a service', async () => {
    const res = await api('PUT', `/api/services/${serviceId}`, { name: 'Updated Service' }, adminToken);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.name, 'Updated Service');
  });

  test('non-admin cannot create services', async () => {
    const res = await api('POST', '/api/services', {
      name: 'Unauthorized',
      description: 'Should fail'
    }, userToken);
    assert.equal(res.status, 403);
  });

  test('admin can delete a service', async () => {
    const res = await api('DELETE', `/api/services/${serviceId}`, null, adminToken);
    assert.equal(res.status, 200);
  });
});
