require('dotenv').config({ path: require('path').join(__dirname, '../.env.example') });
process.env.JWT_SECRET = 'test_secret_key_for_jest';
process.env.JWT_EXPIRES_IN = '1h';

require('./setup');
const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/auth');

// Minimal express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// ── Signup ────────────────────────────────────────────────────────────────────
describe('POST /api/auth/signup', () => {
  it('creates a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice Test', email: 'alice@test.com', password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('alice@test.com');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('rejects duplicate email', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'pass123' });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice2', email: 'alice@test.com', password: 'pass123' });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('rejects missing name', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'noname@test.com', password: 'pass123' });

    expect(res.statusCode).toBe(400);
  });

  it('rejects weak password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Bob', email: 'bob@test.com', password: '123' });

    expect(res.statusCode).toBe(400);
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice Test', email: 'alice@test.com', password: 'password123' });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('student');
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('rejects non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@test.com', password: 'password123' });

    expect(res.statusCode).toBe(401);
  });
});

// ── Get Me ────────────────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice Test', email: 'alice@test.com', password: 'password123' });
    token = res.body.token;
  });

  it('returns current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('alice@test.com');
  });

  it('rejects missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('rejects malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer notarealtoken');
    expect(res.statusCode).toBe(401);
  });
});
