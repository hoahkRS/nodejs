const mongoose = require('mongoose');

function isProvided(value) {
  if (value === undefined || value === null) return false;
  const v = String(value).trim();
  if (!v) return false;
  const lower = v.toLowerCase();
  return lower !== 'null' && lower !== 'undefined';
}

async function connectDB() {
  try {
    const localUri = 'mongodb://localhost:27017/nodejs';
    const baseUri = process.env.MONGO_URI; // single URI source

    const mongoUser = process.env.MONGO_USER;
    const mongoPass = process.env.MONGO_PASS;
    const mongoAuthSource = process.env.MONGO_AUTH_SOURCE; // optional

    const haveCreds = isProvided(mongoUser) && isProvided(mongoPass);

    const opts = {};
    let uri;

    if (haveCreds) {
      // Use provided URI if available; otherwise fall back to local
      uri = baseUri || localUri;
      opts.user = String(mongoUser).trim();
      opts.pass = String(mongoPass).trim();
      if (isProvided(mongoAuthSource)) {
        opts.authSource = String(mongoAuthSource).trim();
      }
    } else {
      // No credentials provided (or null/empty)
      // Respect provided MONGO_URI if set; otherwise fall back to local
      uri = isProvided(baseUri) ? baseUri : localUri;
    }

    await mongoose.connect(uri, opts);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

module.exports = connectDB;
