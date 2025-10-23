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

// Health check
app.get('/', (req, res) => {
  return R.success(res, { status: 'ok' }, 'API is running');
});

// Routers
app.use('/notes', noteRouter);
app.use('/users', userRouter);

module.exports = app;
