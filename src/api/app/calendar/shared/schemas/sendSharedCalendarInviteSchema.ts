import { Segments } from 'celebrate';
import Joi from 'joi';

export const sendSharedCalendarInviteSchema = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  [Segments.BODY]: Joi.object().keys({
    emailBody: Joi.string().required().min(6),
    recipients: Joi.array().items(Joi.string().email()).min(1).required(),
  }),
};
