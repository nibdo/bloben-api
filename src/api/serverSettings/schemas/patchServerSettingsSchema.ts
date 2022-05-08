import Joi from 'joi';

export const patchServerSettingsSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object().keys({
    checkNewVersion: Joi.boolean().required(),
  }),
});
