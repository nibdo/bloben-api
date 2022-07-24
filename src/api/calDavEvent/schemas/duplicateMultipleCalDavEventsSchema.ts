import Joi from 'joi';

export const duplicateMultipleCalDavEventsSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object().keys({
    eventID: Joi.string().required(),
  }),
  body: Joi.object().keys({
    dates: Joi.array().items(Joi.date().iso()).min(1).required(),
    sendInvite: Joi.boolean().optional(),
    inviteMessage: Joi.string().optional().allow(null),
  }),
});
