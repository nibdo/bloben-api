import { Segments } from 'celebrate';
import Joi from 'joi';

export const getPublicEventsInRangeSchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  [Segments.QUERY]: Joi.object({
    rangeFrom: Joi.date().iso().required(),
    rangeTo: Joi.date().iso().required(),
  }),
};
