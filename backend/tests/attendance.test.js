require('dotenv').config({ path: require('path').join(__dirname, '../.env.example') });
process.env.JWT_SECRET = 'test_secret_key_for_jest';
process.env.JWT_EXPIRES_IN = '1h';

require('./setup');
const request    = require('supertest');
const express    = require('express');
const authRoutes = require('../src/routes/auth');
const attRoutes  = require('../src/routes/attendance');

const app = express();
app.use(express.json());
app.use('/api/auth',       authRoutes);
app.use('/api/attendance', attRoutes);

// Helper: register + login, return token
const registerAndLogin = async (email = 'student@test.com') => {
  await request(app)
    .post('/api/auth/signup')
    .send({ name: 'Test Student', email, password: 'password123' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'password123' });
  return res.body.token;
};

// ── Mark attendance ────────────────────────────────────────────────────────────
describe('POST /api/attendance/mark', () => {
  let token;
  beforeEach(async () => { token = await registerAndLogin(); });

  it('marks attendance for today', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(app)
      .post('/api/attendance/mark')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: today, status: 'present', subject: 'Math' });

    expect(res.statusCode).toBe(201);
    expect(res.body.record.status).toBe('present');
    expect(res.body.record.date).toBe(today);
  });

  it('marks attendance as absent', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(app)
      .post('/api/attendance/mark')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: today, status: 'absent', subject: 'Math' });

    expect(res.statusCode).toBe(201);
    expect(res.body.record.status).toBe('absent');
  });

  it('upserts — marking twice same day overwrites', async () => {
    const today = new Date().toISOString().split('T')[0];

    await request(app)
      .post('/api/attendance/mark')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: today, status: 'present', subject: 'Math' });

    const res = await request(app)
      .post('/api/attendance/mark')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: today, status: 'late', subject: 'Math' });

    expect(res.statusCode).toBe(201);
    expect(res.body.record.status).toBe('late');
  });

  it('rejects missing date', async () => {
    const res = await request(app)
      .post('/api/attendance/mark')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'present' });

    expect(res.statusCode).toBe(400);
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/attendance/mark')
      .send({ date: '2024-01-01', status: 'present' });

    expect(res.statusCode).toBe(401);
  });
});

// ── Get my attendance ─────────────────────────────────────────────────────────
describe('GET /api/attendance/my', () => {
  let token;
  beforeEach(async () => {
    token = await registerAndLogin();
    const today = new Date().toISOString().split('T')[0];
    await request(app)
      .post('/api/attendance/mark')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: today, status: 'present', subject: 'General' });
  });

  it('returns records and stats', async () => {
    const res = await request(app)
      .get('/api/attendance/my')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('records');
    expect(res.body).toHaveProperty('stats');
    expect(res.body.records.length).toBeGreaterThan(0);
    expect(res.body.stats).toHaveProperty('percentage');
  });

  it('computes 100% when only present records', async () => {
    const res = await request(app)
      .get('/api/attendance/my')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.stats.percentage).toBe(100);
    expect(res.body.stats.present).toBe(1);
  });
});

// ── Today's status ─────────────────────────────────────────────────────────────
describe('GET /api/attendance/today', () => {
  let token;
  beforeEach(async () => { token = await registerAndLogin(); });

  it('returns null when no record today', async () => {
    const res = await request(app)
      .get('/api/attendance/today')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.record).toBeNull();
  });

  it('returns record after marking', async () => {
    const today = new Date().toISOString().split('T')[0];
    await request(app)
      .post('/api/attendance/mark')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: today, status: 'present' });

    const res = await request(app)
      .get('/api/attendance/today')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.record).not.toBeNull();
    expect(res.body.record.status).toBe('present');
  });
});
