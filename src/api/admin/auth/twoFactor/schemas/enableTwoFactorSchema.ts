import { Segments } from 'celebrate';
import Joi from 'joi';

export const enableTwoFactorSchema = {
  [Segments.BODY]: Joi.object({
    otpCode: Joi.string().min(2).required(),
  }),
};
