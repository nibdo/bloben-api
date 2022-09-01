import { REPEATED_EVENT_CHANGE_TYPE } from '../../../../data/types/enums';
import { prevEventSchema } from './updateCalDavEventSchema';
import Joi from 'joi';

export const updateRepeatedCalDavEventSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    event: Joi.object().required(),
    id: Joi.string().required(),
    externalID: Joi.string().required(),
    calendarID: Joi.string().uuid().required(),
    etag: Joi.string().required(),
    url: Joi.string().required(),
    type: Joi.string()
      .valid(
        REPEATED_EVENT_CHANGE_TYPE.SINGLE,
        REPEATED_EVENT_CHANGE_TYPE.ALL,
        REPEATED_EVENT_CHANGE_TYPE.THIS_AND_FUTURE
      )
      .required(),
    prevEvent: prevEventSchema.allow(null),
    sendInvite: Joi.boolean().optional(),
    inviteMessage: Joi.string().max(300).optional().allow(null),
  }),
});
