import Joi from 'joi';

export const getPublicEventsInRangeSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  query: Joi.object({
    rangeFrom: Joi.date().iso().required(),
    rangeTo: Joi.date().iso().required(),
  }),
  body: Joi.object(),
});
