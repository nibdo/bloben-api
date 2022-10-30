import { Segments } from 'celebrate';
import Joi from 'joi';

export const patchCalDavCalendarSchema = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required(),
  }),
  [Segments.BODY]: Joi.object().keys({
    isHidden: Joi.boolean().required(),
  }),
};
