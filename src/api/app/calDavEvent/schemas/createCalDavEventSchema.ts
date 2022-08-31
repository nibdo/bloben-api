import Joi from 'joi';

export const createEventBodySchema = Joi.object({
  iCalString: Joi.string().min(1).required(),
  externalID: Joi.string().uuid().required(),
  calendarID: Joi.string().uuid().required(),
  sendInvite: Joi.boolean().optional(),
  inviteMessage: Joi.string().optional().allow(null),
});

export const createCalDavEventSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: createEventBodySchema,
});
