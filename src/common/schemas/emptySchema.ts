import { Segments } from 'celebrate';
import Joi from 'joi';

export const emptySchema = {
  [Segments.BODY]: Joi.object().empty(),
  [Segments.QUERY]: Joi.object().empty(),
  [Segments.PARAMS]: Joi.object().empty(),
};

export const usernameSchema = Joi.string().min(3).max(30).required();
