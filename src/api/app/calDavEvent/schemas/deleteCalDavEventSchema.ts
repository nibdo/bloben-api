import { Segments } from 'celebrate';
import Joi from 'joi';

export const deleteCalDavEventSchema = {
  [Segments.BODY]: Joi.object().keys({
    id: Joi.string().required(),
    calendarID: Joi.string().required(),
    url: Joi.string().required(),
    etag: Joi.string().required(),
    sendInvite: Joi.boolean().optional(),
    inviteMessage: Joi.string().max(300).optional().allow(null),
  }),
};
