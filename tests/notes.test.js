/* eslint-disable no-undef */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../modules/app');
const connectDB = require('../modules/database');
const User = require('../modules/user/user.model');
const Note = require('../modules/note/note.model');

jest.setTimeout(30000);

describe('Notes module', () => {
  let token1;
  let token2;
  let user1Id;
  let user2Id;

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
    // Seed two users directly via model to avoid email/route side effects
    const bcrypt = require('bcryptjs');
    const hashed1 = await bcrypt.hash('secret1', 10);
    const hashed2 = await bcrypt.hash('secret2', 10);
    await User.create({ name: 'U1', email: 'u1@example.com', password: hashed1 });
    await User.create({ name: 'U2', email: 'u2@example.com', password: hashed2 });

    const login1 = await request(app).post('/users/login').send({ email: 'u1@example.com', password: 'secret1' }).expect(200);
    const login2 = await request(app).post('/users/login').send({ email: 'u2@example.com', password: 'secret2' }).expect(200);
    token1 = login1.body?.data?.token;
    token2 = login2.body?.data?.token;

    const u1 = await User.findOne({ email: 'u1@example.com' });
    const u2 = await User.findOne({ email: 'u2@example.com' });
    user1Id = u1._id.toString();
    user2Id = u2._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('POST /notes creates sample notes (pagination baseline)', async () => {
    const res = await request(app)
      .post('/notes')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: 'N', body: 'B' })
      .expect(201);
    expect(res.body).toHaveProperty('success', true);

    const list = await request(app)
      .get('/notes')
      .set('Authorization', `Bearer ${token1}`)
      .expect(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data.length).toBeLessThanOrEqual(10);
  });

  test('GET /notes supports limit and page', async () => {
    await request(app).post('/notes').set('Authorization', `Bearer ${token1}`).send({ title: 'N', body: 'B' }).expect(201);

    const page1 = await request(app)
      .get('/notes?limit=5&page=1')
      .set('Authorization', `Bearer ${token1}`)
      .expect(200);
    expect(page1.body.data.length).toBeLessThanOrEqual(5);

    const page2 = await request(app)
      .get('/notes?limit=5&page=2')
      .set('Authorization', `Bearer ${token1}`)
      .expect(200);
    expect(page2.body.data.length).toBeLessThanOrEqual(5);
  });

  test('GET /notes/:id returns 404 for other owner', async () => {
    await request(app).post('/notes').set('Authorization', `Bearer ${token1}`).send({ title: 'N', body: 'B' }).expect(201);
    const list = await request(app).get('/notes').set('Authorization', `Bearer ${token1}`).expect(200);
    const id = list.body.data[0]._id;

    await request(app)
      .get(`/notes/${id}`)
      .set('Authorization', `Bearer ${token2}`)
      .expect(404);
  });

  test('PATCH /notes/:id updates only owner notes', async () => {
    await request(app).post('/notes').set('Authorization', `Bearer ${token1}`).send({ title: 'N', body: 'B' }).expect(201);
    const list = await request(app).get('/notes').set('Authorization', `Bearer ${token1}`).expect(200);
    const id = list.body.data[0]._id;

    const upd = await request(app)
      .patch(`/notes/${id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: 'New Title' })
      .expect(200);
    expect(upd.body.data).toHaveProperty('title', 'New Title');

    await request(app)
      .patch(`/notes/${id}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ title: 'Hacker' })
      .expect(404);
  });

  test('DELETE /notes/:id deletes only owner notes', async () => {
    await request(app).post('/notes').set('Authorization', `Bearer ${token1}`).send({ title: 'N', body: 'B' }).expect(201);
    const list = await request(app).get('/notes').set('Authorization', `Bearer ${token1}`).expect(200);
    const id = list.body.data[0]._id;

    await request(app).delete(`/notes/${id}`).set('Authorization', `Bearer ${token1}`).expect(200);
    await request(app).get(`/notes/${id}`).set('Authorization', `Bearer ${token1}`).expect(404);

    // other user cannot delete a non-owned note (404)
    await request(app).delete(`/notes/${id}`).set('Authorization', `Bearer ${token2}`).expect(404);
  });
});
