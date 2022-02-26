import Joi from 'joi';

import { usernameSchema } from '../../../common/schemas/emptySchema';

export const checkUsernameSchema = Joi.object({
  params: Joi.object({
    username: usernameSchema,
  }),
  query: Joi.object(),
  body: Joi.object(),
});
