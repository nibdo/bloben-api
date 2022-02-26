import Joi from 'joi';

export const createUserSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    username: Joi.string().required().min(3),
    password: Joi.string().required().min(4),
  }),
});
