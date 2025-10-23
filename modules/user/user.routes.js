const express = require("express");
const router = express.Router();
const {
  validateBody,
  validateParams,
  validateQuery,
} = require("../common/validate");
const {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
  loginSchema,
  listQuerySchema,
} = require("./user.validation");
const {
  create,
  show,
  update,
  destroy,
  get,
  login,
  avatar,
} = require("./user.controller");
const auth = require("../middleware/auth");
const parseForm = require('../middleware/form');
const { uploadImage } = require("../middleware/upload");

// Login
router.post("/login", parseForm, validateBody(loginSchema), login);

// Public: serve avatar by user id
router.get("/:id/avatar", validateParams(idParamSchema), avatar);

// Public: Create user with avatar upload (registration)
router.post(
  "/",
  uploadImage.single("avatar"),
  validateBody(createUserSchema),
  create
);

// Require authentication for all routes below
router.use(auth);

// List users (no password) with pagination
router.get("/", validateQuery(listQuerySchema), get);

// Get one user (no password)
router.get("/:id", validateParams(idParamSchema), show);

// Update user with optional avatar upload
router.patch(
  "/:id",
  validateParams(idParamSchema),
  uploadImage.single("avatar"),
  validateBody(updateUserSchema),
  update
);

// Delete user
router.delete("/:id", validateParams(idParamSchema), destroy);

module.exports = router;
