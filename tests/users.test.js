/* eslint-disable no-undef */
const request = require('supertest');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const app = require('../modules/app');
const connectDB = require('../modules/database');
const User = require('../modules/user/user.model');
const Note = require('../modules/note/note.model');

jest.setTimeout(30000);

describe('Users module', () => {
  let token;
  let userId;

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
    // Create a base user via route to also exercise email send (no-op in test)
    const res = await request(app)
      .post('/users')
      .field('name', 'Alice')
      .field('email', 'alice@example.com')
      .field('password', 'secret123')
      .expect(201);
    userId = res.body?.data?._id;

    const login = await request(app)
      .post('/users/login')
      .send({ email: 'alice@example.com', password: 'secret123' })
      .expect(200);
    token = login.body?.data?.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('GET /users requires auth', async () => {
    await request(app).get('/users').expect(401);
  });

  test('GET /users returns list with auth', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('email');
    expect(res.body.data[0]).not.toHaveProperty('password');
  });

  test('GET /users/:id returns single user', async () => {
    const res = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.data).toHaveProperty('email', 'alice@example.com');
  });

  test('PATCH /users/:id updates name', async () => {
    const res = await request(app)
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Alice Updated')
      .expect(200);
    expect(res.body.data).toHaveProperty('name', 'Alice Updated');
  });

  test('PATCH /users/:id can upload avatar', async () => {
    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const fakePng = path.join(tmpDir, 'avatar.png');
    fs.writeFileSync(fakePng, 'fake-png-content');

    const res = await request(app)
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', fakePng)
      .expect(200);
    expect(res.body.data).toHaveProperty('avatar');

    const avatarRes = await request(app)
      .get(`/users/${userId}/avatar`)
      .expect(200);
    expect(avatarRes.headers['content-type']).toMatch(/image|octet-stream/);
  });

  test('DELETE /users/:id deletes user', async () => {
    await request(app)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
