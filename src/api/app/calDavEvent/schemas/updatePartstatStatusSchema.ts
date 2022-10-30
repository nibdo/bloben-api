import { ATTENDEE_PARTSTAT } from '../../../../data/types/enums';
import { Segments } from 'celebrate';
import { map } from 'lodash';
import Joi from 'joi';

export const updatePartstatStatusSchema = {
  [Segments.PARAMS]: Joi.object({
    eventID: Joi.string().required(),
  }),
  [Segments.BODY]: Joi.object({
    status: Joi.string()
      .valid(...map(ATTENDEE_PARTSTAT, (item) => item))
      .required(),
    sendInvite: Joi.boolean().required().default(false),
    inviteMessage: Joi.string().max(300).optional().allow(null),
  }),
};
