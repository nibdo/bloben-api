import Joi from 'joi';

export const deleteCardDavContactSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object(),
});
