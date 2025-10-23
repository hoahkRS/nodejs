require("dotenv").config();
const connectDB = require("./modules/database");
const app = require('./modules/app');

// Connect DB on startup
(async () => {
  await connectDB();
})();

// Routes, middleware, and health check are configured in modules/app.js

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// Routers and health-check are configured in modules/app.js
