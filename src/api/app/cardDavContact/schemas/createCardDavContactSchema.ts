import { Segments } from 'celebrate';
import Joi from 'joi';

export const createCardDavContactSchema = {
  [Segments.BODY]: Joi.object().keys({
    addressBookID: Joi.string().required(),
    fullName: Joi.string().optional(),
    email: Joi.string().email().required(),
  }),
};
