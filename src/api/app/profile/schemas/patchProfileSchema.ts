import { allowedLanguages } from 'bloben-interface';
import Joi from 'joi';

const allowedLanguagesValues = allowedLanguages.map((item) => item.value);

export const patchProfileSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object({
    language: Joi.string()
      .optional()
      .min(2)
      .max(2)
      .valid(...allowedLanguagesValues),
  }),
});
