import { usernameSchema } from '../../../../common/schemas/emptySchema';
import Joi from 'joi';

export const loginWithTwoFactorSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    username: usernameSchema,
    password: Joi.string().min(2).required(),
    otpCode: Joi.string().min(2).required(),
  }),
});
