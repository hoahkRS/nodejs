'use strict';
require('dotenv').config();
const express = require('express');
const path = require('path');
const noteRouter = require('./note/note.routes');
const userRouter = require('./user/user.routes');
const R = require('./common/response');

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(express.static(path.join(process.cwd(), 'public')));

// API docs dashboard at root
app.get('/', (req, res) => {
  return res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// JSON health check
app.get('/health', (req, res) => {
  return R.success(res, { status: 'ok' }, 'API is running');
});

// Routers
app.use('/notes', noteRouter);
app.use('/users', userRouter);

module.exports = app;
