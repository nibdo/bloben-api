import Joi from 'joi';

export const updateUserEmailConfigSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    smtp: Joi.object()
      .keys({
        smtpHost: Joi.string().min(1).required(),
        smtpPort: Joi.number().integer().required().min(1),
        smtpUsername: Joi.string().min(1).required(),
        smtpPassword: Joi.string().min(1).required(),
        smtpEmail: Joi.string().email().min(1).required(),
      })
      .allow(null),
    imap: Joi.object()
      .keys({
        imapHost: Joi.string().min(1).required(),
        imapPort: Joi.number().integer().required().min(1),
        imapUsername: Joi.string().min(1).required(),
        imapPassword: Joi.string().min(1).required(),
      })
      .allow(null),
    imapSyncingInterval: Joi.number().integer().min(15).required(),
  }),
});
