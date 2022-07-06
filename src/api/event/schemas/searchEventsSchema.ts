import Joi from 'joi';

export const searchEventsSchema = Joi.object({
  params: Joi.object(),
  query: Joi.object({
    summary: Joi.string().required().min(3),
  }),
  body: Joi.object(),
});
