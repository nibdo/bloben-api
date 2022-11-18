import Joi from 'joi';

import { Segments } from 'celebrate';
import { usernameSchema } from '../../../../common/schemas/emptySchema';

export const loginRequestSchema = {
  [Segments.BODY]: Joi.object().keys({
    username: usernameSchema,
    password: Joi.string().required(),
    browserID: Joi.string().uuid().optional().allow(null),
  }),
};
