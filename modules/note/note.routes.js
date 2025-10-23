const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { create, get, show, update, destroy } = require("./note.controller");
const {
  validateBody,
  validateParams,
  validateQuery,
} = require("../common/validate");
const {
  createNoteSchema,
  updateNoteSchema,
  idParamSchema,
  listQuerySchema,
} = require("./note.validation");

// Require authentication for all note routes
router.use(auth);

// POST /notes - create a new note
router.post("/", validateBody(createNoteSchema), create);

// GET /notes - list notes with pagination
router.get("/", validateQuery(listQuerySchema), get);

// GET /notes/:id - get a note by id
router.get("/:id", validateParams(idParamSchema), show);

// PATCH /notes/:id - update a note
router.patch(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateNoteSchema),
  update
);

// DELETE /notes/:id - delete a note
router.delete("/:id", validateParams(idParamSchema), destroy);

module.exports = router;
