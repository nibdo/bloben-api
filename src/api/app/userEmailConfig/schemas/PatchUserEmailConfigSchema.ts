import { Segments } from 'celebrate';
import Joi from 'joi';

export const patchUserEmailConfigSchema = {
  [Segments.BODY]: Joi.object({
    isDefault: Joi.boolean().required(),
  }),
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};
