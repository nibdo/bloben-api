import Joi from 'joi';

export const createCardDavContactSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object().keys({
    addressBookID: Joi.string().required(),
    fullName: Joi.string().optional(),
    email: Joi.string().email().required(),
  }),
});
