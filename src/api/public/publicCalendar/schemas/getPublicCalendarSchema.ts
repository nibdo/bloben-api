import Joi from 'joi';

export const getPublicCalendarSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  query: Joi.object(),
  body: Joi.object(),
});
