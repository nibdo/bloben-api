import { Segments } from 'celebrate';
import { calendarSettingsSchema } from '../../../calendarSettings/schemas/patchCalendarSettingsSchema';
import Joi from 'joi';

export const updateSharedCalendarSchema = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().required().min(2),
    password: Joi.string().allow(null),
    expireAt: Joi.date().iso().allow(null),
    calDavCalendars: Joi.array().items(Joi.string().uuid()).min(0).required(),
    webcalCalendars: Joi.array().items(Joi.string().uuid()).min(0).required(),
    settings: calendarSettingsSchema.required(),
  }),
};
