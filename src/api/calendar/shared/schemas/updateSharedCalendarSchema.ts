import { calendarSettingsSchema } from '../../../calendarSettings/schemas/patchCalendarSettingsSchema';
import Joi from 'joi';

export const updateSharedCalendarSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required().min(2),
    password: Joi.string().allow(null),
    expireAt: Joi.date().iso().allow(null),
    calDavCalendars: Joi.array().items(Joi.string().uuid()).min(0).required(),
    webcalCalendars: Joi.array().items(Joi.string().uuid()).min(0).required(),
    settings: calendarSettingsSchema.required(),
  }),
});
