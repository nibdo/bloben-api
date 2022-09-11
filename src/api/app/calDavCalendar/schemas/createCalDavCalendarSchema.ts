import { CALDAV_COMPONENTS } from '../../../../data/types/enums';
import Joi from 'joi';

export const createCalDavCalendarSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object().keys({
    accountID: Joi.string().required(),
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
