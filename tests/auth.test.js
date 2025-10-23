/* eslint-disable no-undef */
const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const app = require('../modules/app');
const connectDB = require('../modules/database');
const User = require('../modules/user/user.model');
const Note = require('../modules/note/note.model');

jest.setTimeout(30000);

describe('Auth and protected endpoints', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/nodejs_test';
    await connectDB();
  });

  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({});
      await Note.deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  async function seedUser(email = 'test@example.com', password = 'password123', name = 'Tester') {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    return { user, email, password };
  }

  test('Login with JSON returns token', async () => {
    const { email, password } = await seedUser();

    const res = await request(app)
      .post('/users/login')
      .send({ email, password })
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data.token');
  });

  test('Login with multipart form-data returns token', async () => {
    const email = 'form@example.com';
    const password = 'pass1234';
    await seedUser(email, password, 'Form User');

    const res = await request(app)
      .post('/users/login')
      .field('email', email)
      .field('password', password)
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data.token');
  });

  test('Protected route requires Authorization header', async () => {
    await request(app).get('/notes').expect(401);
  });

  test('Protected route returns data with valid token', async () => {
    const { email, password } = await seedUser('u1@example.com', 'secret123', 'U1');
    const login = await request(app).post('/users/login').send({ email, password }).expect(200);
    const token = login.body?.data?.token;

    const res = await request(app)
      .get('/notes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
