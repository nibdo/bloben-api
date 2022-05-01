import Joi from 'joi';

export const prevEventSchema = Joi.object().keys({
  externalID: Joi.string().required(),
  id: Joi.string().required(),
  etag: Joi.string().required(),
  url: Joi.string().required(),
});

export const updateEventBodySchema = Joi.object({
  iCalString: Joi.string().min(1).required(),
  id: Joi.string().required(),
  externalID: Joi.string().required(),
  calendarID: Joi.string().uuid().required(),
  etag: Joi.string().required(),
  url: Joi.string().required(),
  prevEvent: prevEventSchema.allow(null),
});

export const updateCalDavEventSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: updateEventBodySchema,
});
