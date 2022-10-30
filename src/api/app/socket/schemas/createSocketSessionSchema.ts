import { Segments } from 'celebrate';
import Joi from 'joi';

export const createSocketSessionSchema = {
  [Segments.BODY]: Joi.object({
    clientSessionId: Joi.string().required(),
  }),
};
