import Joi from 'joi';

export const enableTwoFactorSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    otpCode: Joi.string().min(2).required(),
  }),
});
