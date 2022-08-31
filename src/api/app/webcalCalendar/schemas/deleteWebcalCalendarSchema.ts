import Joi from 'joi';

export const deleteWebcalCalendarSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object(),
});
