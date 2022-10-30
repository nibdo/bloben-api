import { Segments } from 'celebrate';
import Joi from 'joi';

export const searchPublicEventsSchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  [Segments.QUERY]: Joi.object({
    summary: Joi.string().required().min(3),
  }),
};
