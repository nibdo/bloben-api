import { Segments } from 'celebrate';
import Joi from 'joi';

export const patchUserEmailConfigSchema = {
  [Segments.BODY]: Joi.object({
    calendarForImportID: Joi.string().uuid().required().allow(null),
  }),
};
