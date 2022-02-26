import { USER_ROLE } from '../../user/UserEnums';
import Joi from 'joi';

export const updateUserSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    isEnabled: Joi.boolean().required(),
    role: Joi.string().valid(USER_ROLE.USER, USER_ROLE.DEMO).optional(),
  }),
});
