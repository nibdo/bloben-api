import Joi from 'joi';

export const getCalDavEventSchema = Joi.object({
  params: Joi.object(),
  body: Joi.object(),
  query: Joi.object().keys({
    calendarID: Joi.string().required(),
    url: Joi.string().required(),
  }),
});
