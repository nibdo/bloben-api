import { Segments } from 'celebrate';
import Joi from 'joi';

export const createElectronUserSchema = {
  [Segments.BODY]: Joi.object().keys({
    username: Joi.string().required(),
  }),
};
