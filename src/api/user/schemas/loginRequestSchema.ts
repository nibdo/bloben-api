import Joi from 'joi';

import { usernameSchema } from '../../../common/schemas/emptySchema';

export const loginRequestSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    username: usernameSchema,
    password: Joi.string().required(),
  }),
});
