import Joi from 'joi';

export const updateCalDavCalendarSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required().min(2),
    color: Joi.string().required(),
  }),
});
