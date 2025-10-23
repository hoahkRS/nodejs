const Joi = require("joi");
const R = require("./response");

function formatJoiErrors(error) {
  // Convert Joi details to a key: message map
  const details = error?.details || [];
  const errors = {};
  for (const d of details) {
    const key = d.path?.join(".") || "value";
    errors[key] = d.message.replace(/"/g, "");
  }
  return errors;
}

function validate(schema, property = "body", options = {}) {
  const joiOptions = { abortEarly: false, stripUnknown: true, ...options };
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], joiOptions);
    if (error) {
      const errors = formatJoiErrors(error);
      return R.error(res, "Validation failed", 400, errors);
    }
    req[property] = value; // assign sanitized value
    next();
  };
}

module.exports = {
  validateBody: (schema, options) => validate(schema, "body", options),
  validateParams: (schema, options) => validate(schema, "params", options),
  validateQuery: (schema, options) => validate(schema, "query", options),
};
