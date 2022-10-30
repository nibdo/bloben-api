import { LOG_LEVEL } from '../../../../utils/enums';
import { Segments } from 'celebrate';
import Joi from 'joi';

export const getLogsSchema = {
  [Segments.QUERY]: Joi.object({
    date: Joi.string().required(),
    level: Joi.string().required().allow(LOG_LEVEL),
    tags: Joi.string().optional(),
  }),
};
