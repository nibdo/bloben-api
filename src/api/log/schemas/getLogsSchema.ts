import { LOG_LEVEL } from '../../../utils/enums';
import Joi from 'joi';

export const getLogsSchema = Joi.object({
  query: Joi.object({
    date: Joi.string().required(),
    level: Joi.string().required().allow(LOG_LEVEL),
    tags: Joi.string().optional(),
  }),
  params: Joi.object(),
  body: Joi.object(),
});
