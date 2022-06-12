import Joi from 'joi';

export const getEventInRangeSchema = Joi.object({
  params: Joi.object({
    eventID: Joi.string().uuid().required(),
  }),
  query: Joi.object({
    rangeFrom: Joi.date().iso().required(),
    rangeTo: Joi.date().iso().required(),
    isDark: Joi.boolean().optional().default(false),
  }),
  body: Joi.object(),
});
