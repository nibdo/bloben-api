import Joi from 'joi';

export const syncRequestV1Schema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.array().items(
    Joi.object({
      id: Joi.string().uuid().required(),
      updatedAt: Joi.date().iso().required(),
    })
  ),
});
