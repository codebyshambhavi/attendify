require('dotenv').config({ path: require('path').join(__dirname, '../.env.example') });
process.env.JWT_SECRET    = 'test_secret_key_for_jest';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CLIENT_URL    = 'http://localhost:5173';

require('./setup');
const request    = require('supertest');
const express    = require('express');
const authRoutes = require('../src/routes/auth');
const qrRoutes   = require('../src/routes/qr');
const User       = require('../src/models/User');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/qr',   qrRoutes);

const createAdmin = async () => {
  await User.create({ name: 'Admin', email: 'admin@test.com', password: 'Admin@123', role: 'admin' });
  const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'Admin@123' });
  return res.body.token;
};

const createStudent = async () => {
  const res = await request(app).post('/api/auth/signup').send({ name: 'Student', email: 'stu@test.com', password: 'pass123' });
  return { token: res.body.token, user: res.body.user };
};

describe('POST /api/qr/generate', () => {
  it('admin can generate a QR session', async () => {
    const token = await createAdmin();
    const res = await request(app)
      .post('/api/qr/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ subject: 'Math', expiresInMinutes: 10 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('qrImage');
    expect(res.body).toHaveProperty('scanUrl');
    expect(res.body.session.subject).toBe('Math');
  });

  it('student cannot generate QR', async () => {
    const { token } = await createStudent();
    const res = await request(app)
      .post('/api/qr/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ subject: 'Math' });

    expect(res.statusCode).toBe(403);
  });
});

describe('POST /api/qr/scan/:token', () => {
  let adminToken, studentToken, qrToken;

  beforeEach(async () => {
    adminToken          = await createAdmin();
    const stu           = await createStudent();
    studentToken        = stu.token;

    const genRes = await request(app)
      .post('/api/qr/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ subject: 'Physics', expiresInMinutes: 15 });

    qrToken = genRes.body.session.token;
  });

  it('student can scan a valid QR token', async () => {
    const res = await request(app)
      .post(`/api/qr/scan/${qrToken}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/marked/i);
    expect(res.body.record.status).toBe('present');
  });

  it('student cannot scan the same QR twice', async () => {
    await request(app)
      .post(`/api/qr/scan/${qrToken}`)
      .set('Authorization', `Bearer ${studentToken}`);

    const res = await request(app)
      .post(`/api/qr/scan/${qrToken}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already scanned/i);
  });

  it('returns 404 for invalid token', async () => {
    const res = await request(app)
      .post('/api/qr/scan/deadbeefdeadbeefdeadbeefdeadbeefdeadbeef')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(404);
  });
});

describe('GET /api/qr/sessions', () => {
  it('admin can list their sessions', async () => {
    const token = await createAdmin();
    await request(app)
      .post('/api/qr/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ subject: 'History' });

    const res = await request(app)
      .get('/api/qr/sessions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.sessions.length).toBeGreaterThanOrEqual(1);
  });
});
