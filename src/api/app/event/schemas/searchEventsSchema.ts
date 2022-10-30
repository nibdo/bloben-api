import { Segments } from 'celebrate';
import Joi from 'joi';

export const searchEventsSchema = {
  [Segments.QUERY]: Joi.object({
    summary: Joi.string().required().min(3),
  }),
};
