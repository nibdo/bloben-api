import Joi from 'joi';

import { usernameSchema } from '../../../../common/schemas/emptySchema';

export const getChallengeSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object({
    username: usernameSchema,
  }),
  body: Joi.object(),
});
