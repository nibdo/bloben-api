import Joi from 'joi';

export const changePasswordRequestSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    oldPassword: Joi.string().min(1).required(),
    newPassword: Joi.string().required().min(6),
    cryptoPassword: Joi.string().required().min(1),
  }),
});
