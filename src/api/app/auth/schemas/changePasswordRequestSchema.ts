import { Segments } from 'celebrate';
import Joi from 'joi';

export const changePasswordRequestSchema = {
  [Segments.BODY]: Joi.object({
    oldPassword: Joi.string().min(1).required(),
    newPassword: Joi.string().required().min(6),
    cryptoPassword: Joi.string().required().min(1),
  }),
};
