import { Segments } from 'celebrate';
import Joi from 'joi';

export const changeAdminPasswordSchema = {
  [Segments.BODY]: Joi.object({
    oldPassword: Joi.string().min(2).required(),
    password: Joi.string().min(2).required(),
  }),
};
