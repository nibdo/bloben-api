import { Segments } from 'celebrate';
import Joi from 'joi';

export const getCalDavAccount = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};
