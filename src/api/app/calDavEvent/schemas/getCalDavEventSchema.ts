import { Segments } from 'celebrate';
import Joi from 'joi';

export const getCalDavEventSchema = {
  [Segments.QUERY]: Joi.object().keys({
    calendarID: Joi.string().required(),
    url: Joi.string().required(),
  }),
};
