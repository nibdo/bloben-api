import Joi from 'joi';

export const deleteCalDavEventSchema = Joi.object({
  params: Joi.object(),
  query: Joi.object(),
  body: Joi.object().keys({
    id: Joi.string().required(),
    calendarID: Joi.string().required(),
    url: Joi.string().required(),
    etag: Joi.string().required(),
    sendInvite: Joi.boolean().optional(),
    inviteMessage: Joi.string().max(300).optional().allow(null),
  }),
});
