// authValidation.js
import Joi from 'joi';

export const signupSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'monitor', 'agent'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
