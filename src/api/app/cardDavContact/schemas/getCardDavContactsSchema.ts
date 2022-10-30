import { Segments } from 'celebrate';
import Joi from 'joi';

export const getCardDavContactsSchema = {
  [Segments.QUERY]: Joi.object().keys({
    addressBookID: Joi.string().uuid().required(),
  }),
};
