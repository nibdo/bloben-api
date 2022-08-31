import Joi from 'joi';

export const getCachedEventsSchema = Joi.object({
  params: Joi.object(),
  query: Joi.object({
    isDark: Joi.boolean().optional().default(false),
  }),
  body: Joi.object(),
});
