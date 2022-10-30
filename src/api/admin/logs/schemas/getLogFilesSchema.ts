import { LOG_FILE_TYPE } from '../../../../data/types/enums';
import { Segments } from 'celebrate';
import Joi from 'joi';

export const getLogFilesSchema = {
  [Segments.QUERY]: Joi.object({
    type: Joi.string().valid(LOG_FILE_TYPE),
  }),
};
