import { Segments } from 'celebrate';
import Joi from 'joi';

export const getCachedEventsSchema = {
  [Segments.QUERY]: Joi.object({
    isDark: Joi.boolean().optional().default(false),
  }),
};
