import Joi from 'joi';

import { usernameSchema } from '../../../../common/schemas/emptySchema';

export const loginDemoRequestSchema = Joi.object({
  params: Joi.object(),
  query: Joi.object({
    username: usernameSchema,
    password: Joi.string().required(),
    redirect: Joi.string().required(),
  }),
  body: Joi.object(),
});
