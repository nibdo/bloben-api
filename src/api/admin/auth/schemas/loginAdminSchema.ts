import Joi from 'joi';

import { Segments } from 'celebrate';
import { usernameSchema } from '../../../../common/schemas/emptySchema';

export const loginAdminSchema = {
  [Segments.BODY]: Joi.object({
    username: usernameSchema,
    password: Joi.string().min(2).required(),
  }),
};
