import Joi from 'joi';

export const getLogsSchema = Joi.object({
  query: Joi.object({
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer(),
  }),
  params: Joi.object(),
  body: Joi.object(),
});
