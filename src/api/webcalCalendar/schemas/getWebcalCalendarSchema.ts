import Joi from 'joi';

export const getWebcalCalendarSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object(),
});
