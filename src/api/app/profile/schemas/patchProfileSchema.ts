import { Segments } from 'celebrate';
import { allowedLanguages } from 'bloben-interface';
import Joi from 'joi';

const allowedLanguagesValues = allowedLanguages.map((item) => item.value);

export const patchProfileSchema = {
  [Segments.BODY]: Joi.object({
    language: Joi.string()
      .optional()
      .min(2)
      .max(2)
      .valid(...allowedLanguagesValues),
  }),
};
