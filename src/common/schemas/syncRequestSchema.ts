import Joi from 'joi';

export const syncRequestSchema = Joi.object({
  query: Joi.object({
    syncDate: Joi.date().iso().required().allow(null),
  }),
  params: Joi.object(),
  body: Joi.object(),
});
