import Joi from 'joi';

export const loginWithTwoFactorSchema = Joi.object({
  body: Joi.object({
    otpCode: Joi.string().required(),
  }),
  params: Joi.object(),
  query: Joi.object(),
});
