import { Segments } from 'celebrate';
import { calendarSettingsSchema } from '../../../calendarSettings/schemas/patchCalendarSettingsSchema';
import Joi from 'joi';

export const createSharedCalendarSchema = {
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().required().min(2),
    password: Joi.string().allow(null),
    expireAt: Joi.date().allow(null),
    calDavCalendars: Joi.array().items(Joi.string().uuid()).min(0).required(),
    webcalCalendars: Joi.array().items(Joi.string().uuid()).min(0).required(),
    settings: calendarSettingsSchema.required(),
  }),
};
