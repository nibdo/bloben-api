import { LOG_FILE_TYPE } from '../../../../bloben-interface/enums';
import Joi from 'joi';

export const getLogFilesSchema = Joi.object({
  query: Joi.object({
    type: Joi.string().valid(LOG_FILE_TYPE),
  }),
  params: Joi.object(),
  body: Joi.object(),
});
