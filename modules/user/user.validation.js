const Joi = require('joi');

const objectId = Joi.string().length(24).hex().message('Invalid user id');

const createUserSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).required(),
  avatar: Joi.any().optional(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(1),
  email: Joi.string().trim().lowercase().email(),
  password: Joi.string().min(6),
  avatar: Joi.any().optional(),
}).min(0);

const listQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10),
  page: Joi.number().integer().min(1).default(1),
});

const idParamSchema = Joi.object({ id: objectId.required() });
const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

module.exports = { createUserSchema, updateUserSchema, idParamSchema, loginSchema, listQuerySchema };
