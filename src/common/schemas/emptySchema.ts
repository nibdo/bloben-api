import Joi from 'joi';

export const emptySchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object(),
});

export const usernameSchema = Joi.string().min(3).max(30).required();
