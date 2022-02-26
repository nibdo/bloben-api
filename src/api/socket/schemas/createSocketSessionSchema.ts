import Joi from 'joi';

export const createSocketSessionSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    clientSessionId: Joi.string().required(),
  }),
});
