import Joi from 'joi';

export const createWebcalCalendarSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    url: Joi.string().uri().required(),
    name: Joi.string().required(),
    color: Joi.string().required(),
    syncFrequency: Joi.number().integer().min(15).required(),
  }),
});
