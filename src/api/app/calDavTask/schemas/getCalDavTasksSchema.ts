import Joi from 'joi';

export const getCalDavTasksSchema = Joi.object({
  params: Joi.object(),
  query: Joi.object().keys({
    calendarID: Joi.string().required(),
    limit: Joi.number().integer().default(20).required(),
    page: Joi.number().integer().min(1).required(),
  }),
  body: Joi.object(),
});
