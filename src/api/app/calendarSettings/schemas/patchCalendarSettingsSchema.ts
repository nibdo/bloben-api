import { CALENDAR_VIEW } from 'kalend/common/enums';
import Joi from 'joi';

export const calendarSettingsSchema = Joi.object().keys({
  timeFormat: Joi.number().allow(12, 24).optional(),
  startOfWeek: Joi.string().allow('Monday', 'Sunday').optional(),
  defaultView: Joi.string()
    .allow(
      CALENDAR_VIEW.DAY,
      CALENDAR_VIEW.AGENDA,
      CALENDAR_VIEW.MONTH,
      CALENDAR_VIEW.WEEK,
      CALENDAR_VIEW.THREE_DAYS
    )
    .optional(),
  hourHeight: Joi.number().min(10).max(120).optional(),
  defaultCalendarID: Joi.string().uuid().optional(),
  timezone: Joi.string().optional(),
  showWeekNumbers: Joi.boolean().optional(),
  defaultAddressBookID: Joi.string().uuid().optional(),
  saveContactsAuto: Joi.boolean().optional(),
});

export const patchCalendarSettingsSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: calendarSettingsSchema,
});
