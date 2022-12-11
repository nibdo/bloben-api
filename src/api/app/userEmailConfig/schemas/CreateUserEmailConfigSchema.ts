import { Segments } from 'celebrate';
import Joi from 'joi';

export const createUserEmailConfigSchema = {
  [Segments.BODY]: Joi.object({
    smtp: Joi.object()
      .keys({
        smtpHost: Joi.string().min(1).required(),
        smtpPort: Joi.number().integer().required().min(1),
        smtpUsername: Joi.string().min(1).required(),
        smtpPassword: Joi.string().min(1).required(),
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
    aliases: Joi.array()
      .items(Joi.string().email().required())
      .min(1)
      .required(),
    defaultAlias: Joi.string().email().required(),
    calendarForImportID: Joi.string().uuid().required().allow(null),
  }),
};
