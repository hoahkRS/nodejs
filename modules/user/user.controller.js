const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const User = require("./user.model");
const R = require("../common/response");
const Mail = require("../common/mail");

// Create user (hash password) - POST /users
async function create(req, res) {
  try {
    const { name, email, password } = req.body || {};
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const avatar = req.file ? req.file.filename : undefined;
    const user = await User.create({ name, email, password: hashed, avatar });

    const { password: _pw, ...safe } = user.toObject();

    // Attempt to send welcome email; rollback user if sending fails
    try {
      await Mail.sendMail({
        to: safe.email,
        subject: "Welcome to Notes API",
        text: `Hi ${safe.name || ""}, your account was created successfully.`,
        html: `<p>Hi <strong>${
          safe.name || ""
        }</strong>,</p><p>Your account was created successfully.</p>`,
      });
    } catch (mailErr) {
      // Rollback: remove the created user
      try {
        await User.findByIdAndDelete(user._id);
        if (req?.file?.path) {
          fs.unlink(req.file.path, () => {});
        }
      } catch (_) {}
      const message = "Failed to send welcome email. User creation cancelled.";
      // If forbidden from SendGrid, surface a 403 to reflect auth issue; otherwise 500
      const status =
        mailErr && (mailErr.code === 403 || mailErr.statusCode === 403)
          ? 403
          : 500;

      return R.error(res, message, status);
    }

    return R.success(res, safe, "User created successfully", 201);
  } catch (err) {
    console.error("user.create error:", err);
    try {
      if (req?.file?.path) {
        fs.unlink(req.file.path, () => {});
      }
    } catch (_) {}
    // Handle duplicate email
    if (err && err.code === 11000) {
      return R.error(res, "Email already exists", 409);
    }
    return R.error(res, "Internal server error", 500);
  }
}

// Get single user (no password) - GET /users/:id
async function show(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("name email avatar");
    if (!user) return R.error(res, "User not found", 404);
    return R.success(res, user);
  } catch (err) {
    console.error("user.show error:", err);
    return R.error(res, "Internal server error", 500);
  }
}

// Update user - PATCH /users/:id
async function update(req, res) {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      payload.password = await bcrypt.hash(payload.password, salt);
    }

    if (req.file) {
      payload.avatar = req.file.filename;
    }
    const user = await User.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      select: "name email avatar",
    });
    if (!user) {
      // Remove newly uploaded avatar file since update failed
      try {
        if (req?.file?.path) {
          fs.unlink(req.file.path, () => {});
        }
      } catch (_) {}
      return R.error(res, "User not found", 404);
    }
    return R.success(res, user, "User updated successfully");
  } catch (err) {
    console.error("user.update error:", err);
    try {
      if (req?.file?.path) {
        fs.unlink(req.file.path, () => {});
      }
    } catch (_) {}

    if (err && err.code === 11000) {
      return R.error(res, "Email already exists", 409);
    }
    return R.error(res, "Internal server error", 500);
  }
}

// Delete user - DELETE /users/:id
async function destroy(req, res) {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return R.error(res, "User not found", 404);
    return R.success(res, null, "User deleted successfully");
  } catch (err) {
    console.error("user.destroy error:", err);
    return R.error(res, "Internal server error", 500);
  }
}

// List users (no password) - GET /users
async function get(req, res) {
  try {
    const { limit = 10, page = 1 } = req.query || {};
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return R.success(res, users);
  } catch (err) {
    console.error("user.get error:", err);
    return R.error(res, "Internal server error", 500);
  }
}

// Login - POST /users/login
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return R.error(res, "Email or password is incorrect.", 401);

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return R.error(res, "Email or password is incorrect.", 401);

    // Sign JWT with user id
    const secret = process.env.JWT_SECRET || "dev-secret";
    const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
    const token = jwt.sign({ id: user._id.toString() }, secret, { expiresIn });
    return R.success(res, { name: user.name, email: user.email, token });
  } catch (err) {
    console.error("user.login error:", err);
    return R.error(res, "Internal server error", 500);
  }
}

// Serve avatar by user id
async function avatar(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("avatar");
    if (!user || !user.avatar) return R.error(res, "Avatar not found", 404);

    // Build absolute path to file and stream
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "avatars",
      user.avatar
    );
    if (!fs.existsSync(filePath)) return R.error(res, "Avatar not found", 404);
    return res.sendFile(filePath);
  } catch (err) {
    console.error("user.avatar error:", err);
    return R.error(res, "Internal server error", 500);
  }
}

module.exports = { create, show, update, destroy, get, login, avatar };
