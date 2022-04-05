import Joi from 'joi';

export const patchCalDavCalendarSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    isHidden: Joi.boolean().required(),
  }),
});
