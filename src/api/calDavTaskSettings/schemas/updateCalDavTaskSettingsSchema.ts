import Joi from 'joi';

export const updateCalDavTaskSettingsSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object().keys({
    calendarID: Joi.string().required(),
  }),
  body: Joi.object().keys({
    order: Joi.array().items(Joi.string()).required(),
    orderBy: Joi.string()
      .required()
      .allow('createdAt', 'updatedAt', 'custom', 'name'),
  }),
});
