import { CALDAV_COMPONENTS } from '../../../bloben-interface/enums';
import Joi from 'joi';

export const updateCalDavCalendarSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required().min(3),
    color: Joi.string().required().default('indigo'),
    components: Joi.array()
      .items(
        Joi.string().valid(
          CALDAV_COMPONENTS.VTODO,
          CALDAV_COMPONENTS.VEVENT,
          CALDAV_COMPONENTS.VJOURNAL
        )
      )
      .min(1)
      .required(),
  }),
});
