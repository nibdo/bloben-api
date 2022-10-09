import Joi from 'joi';

export const getEventsSchema = Joi.object({
  params: Joi.object(),
  query: Joi.object({
    rangeFrom: Joi.date().iso().required(),
    rangeTo: Joi.date().iso().required(),
    showTasks: Joi.boolean().required(),
    isDark: Joi.boolean().optional().default(false),
  }),
  body: Joi.object(),
});
