import Joi from 'joi';

export const getCardDavContactsSchema = Joi.object({
  query: Joi.object().keys({
    addressBookID: Joi.string().uuid().required(),
  }),
  params: Joi.object(),
  body: Joi.object(),
});
