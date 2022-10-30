import { Segments } from 'celebrate';
import Joi from 'joi';

export const searchCardDavContactSchema = {
  [Segments.QUERY]: Joi.object().keys({
    text: Joi.string().required().min(0),
  }),
};
