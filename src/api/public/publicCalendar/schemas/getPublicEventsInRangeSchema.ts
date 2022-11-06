import { Segments } from 'celebrate';
import Joi from 'joi';

export const getPublicEventsInRangeSchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  [Segments.QUERY]: Joi.object({
    rangeFrom: Joi.string().isoDate().required(),
    rangeTo: Joi.string().isoDate().required(),
  }),
};
