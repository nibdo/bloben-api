import Joi from 'joi';

export const sendSharedCalendarInviteSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object().keys({
    emailBody: Joi.string().required().min(6),
    recipients: Joi.array().items(Joi.string().email()).min(1).required(),
  }),
});
