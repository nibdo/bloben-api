import { Segments } from 'celebrate';
import Joi from 'joi';

export const getEventInRangeSchema = {
  [Segments.PARAMS]: Joi.object({
    eventID: Joi.string().uuid().required(),
  }),
  [Segments.QUERY]: Joi.object({
    rangeFrom: Joi.string().isoDate().required(),
    rangeTo: Joi.string().isoDate().required(),
    showTasks: Joi.boolean().required(),
    isDark: Joi.boolean().optional().default(false),
  }),
};
