import { Segments } from 'celebrate';
import Joi from 'joi';

export const deleteUserEmailConfigSchema = {
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};
