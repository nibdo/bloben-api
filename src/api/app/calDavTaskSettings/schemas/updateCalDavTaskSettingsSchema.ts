import { Segments } from 'celebrate';
import Joi from 'joi';

export const updateCalDavTaskSettingsSchema = {
  [Segments.PARAMS]: Joi.object().keys({
    calendarID: Joi.string().required(),
  }),
  [Segments.BODY]: Joi.object().keys({
    order: Joi.array().items(Joi.string()).required(),
    orderBy: Joi.string()
      .required()
      .allow('createdAt', 'updatedAt', 'custom', 'name'),
  }),
};
