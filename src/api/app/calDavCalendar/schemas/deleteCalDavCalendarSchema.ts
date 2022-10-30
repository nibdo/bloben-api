import { Segments } from 'celebrate';
import Joi from 'joi';

export const deleteCalDavCalendarSchema = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required(),
  }),
};
