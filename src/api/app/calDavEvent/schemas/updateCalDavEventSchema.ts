import { Segments } from 'celebrate';
import Joi from 'joi';

export const prevEventSchema = Joi.object().keys({
  externalID: Joi.string().required(),
  id: Joi.string().required(),
  etag: Joi.string().required(),
  url: Joi.string().required(),
});

export const updateEventBodySchema = Joi.object({
  iCalString: Joi.string().min(1).required(),
  id: Joi.string().required(),
  externalID: Joi.string().required(),
  calendarID: Joi.string().uuid().required(),
  etag: Joi.string().required(),
  url: Joi.string().required(),
  prevEvent: prevEventSchema.allow(null),
  sendInvite: Joi.boolean().optional(),
  inviteMessage: Joi.string().max(300).optional().allow(null),
});

export const updateCalDavEventSchema = {
  [Segments.BODY]: updateEventBodySchema,
};
