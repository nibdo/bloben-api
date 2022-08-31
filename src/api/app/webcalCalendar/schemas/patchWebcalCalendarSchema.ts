import Joi from 'joi';

export const patchWebcalCalendarSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    isHidden: Joi.boolean().required(),
  }),
});
