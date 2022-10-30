import { Segments } from 'celebrate';
import Joi from 'joi';

export const updateCalDavAccount = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  [Segments.BODY]: Joi.object({
    password: Joi.string().required().min(1),
  }),
};
