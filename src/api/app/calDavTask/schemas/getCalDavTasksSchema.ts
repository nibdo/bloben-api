import { Segments } from 'celebrate';
import Joi from 'joi';

export const getCalDavTasksSchema = {
  [Segments.QUERY]: Joi.object().keys({
    calendarID: Joi.string().required(),
    limit: Joi.number().integer().default(20).required(),
    page: Joi.number().integer().min(1).required(),
  }),
};
