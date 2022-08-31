import Joi from 'joi';

export const searchCardDavContactSchema = Joi.object({
  query: Joi.object().keys({
    text: Joi.string().required().min(0),
  }),
  params: Joi.object(),
  body: Joi.object(),
});
