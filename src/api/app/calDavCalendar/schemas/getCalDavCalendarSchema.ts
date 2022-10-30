import { CALDAV_COMPONENTS } from '../../../../data/types/enums';
import { Segments } from 'celebrate';
import Joi from 'joi';

export const getCalDavCalendarSchema = {
  [Segments.QUERY]: Joi.object().keys({
    component: Joi.string()
      .valid(
        CALDAV_COMPONENTS.VEVENT,
        CALDAV_COMPONENTS.VTODO,
        CALDAV_COMPONENTS.VJOURNAL
      )
      .optional(),
  }),
};
