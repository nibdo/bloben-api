import { ATTENDEE_PARTSTAT } from '../../../bloben-interface/enums';
import { map } from 'lodash';
import Joi from 'joi';

export const updatePartstatStatusSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object({
    eventID: Joi.string().required(),
  }),
  body: Joi.object({
    status: Joi.string()
      .valid(...map(ATTENDEE_PARTSTAT, (item) => item))
      .required(),
  }),
});
