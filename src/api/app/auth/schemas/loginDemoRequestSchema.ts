import Joi from 'joi';

import { Segments } from 'celebrate';
import { usernameSchema } from '../../../../common/schemas/emptySchema';

export const loginDemoRequestSchema = {
  [Segments.QUERY]: Joi.object({
    username: usernameSchema,
    password: Joi.string().required(),
    redirect: Joi.string().required(),
  }),
};
