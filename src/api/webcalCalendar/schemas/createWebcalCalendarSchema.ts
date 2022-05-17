import Joi from 'joi';

export const createWebcalCalendarSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    url: Joi.string().uri().required(),
    name: Joi.string().required(),
    color: Joi.string().required(),
    syncFrequency: Joi.number().integer().min(1).required(),
    alarms: Joi.array()
      .items(
        Joi.object().keys({
          amount: Joi.number().min(0).required(),
          timeUnit: Joi.string().allow('minutes', 'hours', 'days').required(),
        })
      )
      .min(0),
    userMailto: Joi.string().email().optional().allow(null),
  }),
});
