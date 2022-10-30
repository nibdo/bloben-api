import { Segments } from 'celebrate';
import Joi from 'joi';

export const duplicateMultipleCalDavEventsSchema = {
  [Segments.PARAMS]: Joi.object().keys({
    eventID: Joi.string().required(),
  }),
  [Segments.BODY]: Joi.object().keys({
    dates: Joi.array().items(Joi.string()).min(1).required(),
    sendInvite: Joi.boolean().optional(),
    inviteMessage: Joi.string().optional().allow(null),
  }),
};
