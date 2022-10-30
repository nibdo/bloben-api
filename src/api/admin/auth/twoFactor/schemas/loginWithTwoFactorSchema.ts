import { Segments } from 'celebrate';
import { usernameSchema } from '../../../../../common/schemas/emptySchema';
import Joi from 'joi';

export const loginWithTwoFactorSchema = {
  [Segments.BODY]: Joi.object({
    username: usernameSchema,
    password: Joi.string().min(2).required(),
    otpCode: Joi.string().min(2).required(),
  }),
};
