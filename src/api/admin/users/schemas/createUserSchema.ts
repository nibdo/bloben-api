import { usernameSchema } from '../../../../common/schemas/emptySchema';
import Joi from 'joi';

export const createUserSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    username: usernameSchema,
    password: Joi.string().required().min(4),
  }),
});
