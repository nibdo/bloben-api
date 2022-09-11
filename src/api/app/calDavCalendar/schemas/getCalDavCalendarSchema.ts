import { CALDAV_COMPONENTS } from '../../../../data/types/enums';
import Joi from 'joi';

export const getCalDavCalendarSchema = Joi.object({
  query: Joi.object().keys({
    component: Joi.string()
      .valid(
        CALDAV_COMPONENTS.VEVENT,
        CALDAV_COMPONENTS.VTODO,
        CALDAV_COMPONENTS.VJOURNAL
      )
      .optional(),
  }),
  params: Joi.object(),
  body: Joi.object(),
});
