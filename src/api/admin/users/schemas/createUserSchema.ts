import { Segments } from 'celebrate';
import { usernameSchema } from '../../../../common/schemas/emptySchema';
import Joi from 'joi';

export const createUserSchema = {
  [Segments.BODY]: Joi.object({
    username: usernameSchema,
    password: Joi.string().required().min(4),
  }),
};
