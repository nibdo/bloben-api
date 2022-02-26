import Joi from 'joi';

export const createCalDavAccount = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    username: Joi.string().min(1).required(),
    password: Joi.string().min(1).required(),
    url: Joi.string().min(1).required(),
  }),
});
