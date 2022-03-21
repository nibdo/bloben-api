import Joi from 'joi';

export const updateUserEmailConfigSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    smtpHost: Joi.string().min(1).required(),
    smtpPort: Joi.number().integer().required().min(1),
    smtpUsername: Joi.string().min(1).required(),
    smtpPassword: Joi.string().min(1).required(),
    smtpEmail: Joi.string().email().min(1).required(),
  }),
});
