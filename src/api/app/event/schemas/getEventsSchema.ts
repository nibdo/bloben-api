import { Segments } from 'celebrate';
import Joi from 'joi';

export const getEventsSchema = {
  [Segments.QUERY]: Joi.object({
    rangeFrom: Joi.string().isoDate().required(),
    rangeTo: Joi.string().isoDate().required(),
    showTasks: Joi.boolean().required(),
    isDark: Joi.boolean().optional().default(false),
  }),
};
