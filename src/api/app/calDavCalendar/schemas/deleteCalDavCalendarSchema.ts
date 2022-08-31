import Joi from 'joi';

export const deleteCalDavCalendarSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object(),
});
