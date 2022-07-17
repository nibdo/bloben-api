import Joi from 'joi';

export const getSharedCalendarSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object(),
});
