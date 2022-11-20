import {
  ATTENDEE_PARTSTAT,
  REPEATED_EVENT_CHANGE_TYPE,
} from '../../../../data/types/enums';
import { Segments } from 'celebrate';
import { map } from 'lodash';
import Joi from 'joi';

export const updatePartstatStatusRepeatedEventSchema = {
  [Segments.PARAMS]: Joi.object({
    eventID: Joi.string().required(),
  }),
  [Segments.BODY]: Joi.object({
    status: Joi.string()
      .valid(...map(ATTENDEE_PARTSTAT, (item) => item))
      .required(),
    sendInvite: Joi.boolean().required().default(false),
    inviteMessage: Joi.string().max(300).optional().allow(null),
    type: Joi.string()
      .valid(REPEATED_EVENT_CHANGE_TYPE.SINGLE, REPEATED_EVENT_CHANGE_TYPE.ALL)
      .required(),
    recurrenceID: Joi.object({
      value: Joi.string().isoDate().required(),
      timezone: Joi.string().optional(),
    }),
    startAt: Joi.string().isoDate().required(),
    endAt: Joi.string().isoDate().required(),
  }),
};
