import { USER_ROLE } from '../../../app/auth/UserEnums';
import { usernameSchema } from '../../../../common/schemas/emptySchema';
import Joi from 'joi';

export const updateUserSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    isEnabled: Joi.boolean().optional(),
    emailsAllowed: Joi.boolean().optional(),
    role: Joi.string().valid(USER_ROLE.USER, USER_ROLE.DEMO).optional(),
    username: usernameSchema.optional(),
    password: Joi.string().min(4).optional(),
  }),
});
