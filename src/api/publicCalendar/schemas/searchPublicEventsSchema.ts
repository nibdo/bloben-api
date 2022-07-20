import Joi from 'joi';

export const searchPublicEventsSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  query: Joi.object({
    summary: Joi.string().required().min(3),
  }),
  body: Joi.object(),
});
