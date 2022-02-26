import Joi from 'joi';

export const createPushSubscriptionSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    client: Joi.optional(),
    subscription: Joi.object({
      keys: Joi.object({
        auth: Joi.string().min(1).required(),
        p256dh: Joi.string().min(1).required(),
      }),
      endpoint: Joi.string().min(1).required(),
      expirationTime: Joi.string().optional().allow(null),
    }).required(),
  }),
});
