import Joi from 'joi';

export const changeAdminPasswordSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    oldPassword: Joi.string().min(2).required(),
    password: Joi.string().min(2).required(),
  }),
});
