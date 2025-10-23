const Joi = require("joi");

const objectId = Joi.string().length(24).hex().message("Invalid note id");

const createNoteSchema = Joi.object({
  title: Joi.string().trim().min(1).required().messages({
    "string.empty": "Title must not be empty",
    "any.required": "Title is required",
  }),
  body: Joi.string().trim().allow("").optional(),
});

const updateNoteSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .messages({ "string.empty": "Title must not be empty" }),
  body: Joi.string().trim().allow(""),
})
  .min(1)
  .messages({
    "object.min": "At least one field (title or body) must be provided",
  });

const listQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10),
  page: Joi.number().integer().min(1).default(1),
  sortBy: Joi.string().valid("createdAt", "title").default("createdAt"),
  sortType: Joi.string().valid("asc", "desc").insensitive().default("desc"),
});

const idParamSchema = Joi.object({ id: objectId.required() });

module.exports = {
  createNoteSchema,
  updateNoteSchema,
  idParamSchema,
  listQuerySchema,
};
