import { Segments } from 'celebrate';
import Joi from 'joi';

export const patchWebcalCalendarSchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  [Segments.BODY]: Joi.object({
    isHidden: Joi.boolean().required(),
  }),
};
