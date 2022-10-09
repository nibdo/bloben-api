import { SOURCE_TYPE } from '../../../../data/types/enums';
import Joi from 'joi';

export const getEventSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
  query: Joi.object({
    type: Joi.string().valid(SOURCE_TYPE.CALDAV, SOURCE_TYPE.WEBCAL).required(),
    isDark: Joi.boolean().required(),
  }),
  body: Joi.object(),
});
