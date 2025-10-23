'use strict';
const multer = require('multer');

// Parses multipart/form-data text fields only; rejects file parts
const parser = multer().none();

module.exports = parser;
