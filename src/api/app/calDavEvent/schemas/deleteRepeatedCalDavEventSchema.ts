import { REPEATED_EVENT_CHANGE_TYPE } from '../../../../data/types/enums';
import Joi from 'joi';

export const DateTimezoneObject = Joi.object().keys({
  value: Joi.string().required(),
  timezone: Joi.string().allow(null),
});

export const deleteRepeatedCalDavEventSchema = Joi.object({
  params: Joi.object(),
  query: Joi.object(),
  body: Joi.object().keys({
    id: Joi.string().required(),
    calendarID: Joi.string().required(),
    url: Joi.string().required(),
    etag: Joi.string().required(),
    type: Joi.string().allow(
      REPEATED_EVENT_CHANGE_TYPE.SINGLE,
      REPEATED_EVENT_CHANGE_TYPE.ALL,
      REPEATED_EVENT_CHANGE_TYPE.THIS_AND_FUTURE
    ),
    iCalString: Joi.string().allow(null),
    recurrenceID: DateTimezoneObject.allow(null),
    exDates: Joi.array().items(DateTimezoneObject).allow(null),
    sendInvite: Joi.boolean().optional(),
    inviteMessage: Joi.string().optional().allow(null),
  }),
});
