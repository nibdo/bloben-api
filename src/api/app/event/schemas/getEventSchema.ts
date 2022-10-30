import { SOURCE_TYPE } from '../../../../data/types/enums';
import { Segments } from 'celebrate';
import Joi from 'joi';

export const getEventSchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().required(),
  }),
  [Segments.QUERY]: Joi.object({
    type: Joi.string().valid(SOURCE_TYPE.CALDAV, SOURCE_TYPE.WEBCAL).required(),
    isDark: Joi.boolean().required(),
  }),
};
