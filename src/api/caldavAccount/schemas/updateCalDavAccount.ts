import Joi from 'joi';

export const updateCalDavAccount = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  query: Joi.object(),
  body: Joi.object({
    password: Joi.string().required().min(1),
  }),
});
