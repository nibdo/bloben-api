import { LOCATION_PROVIDER } from '../../../bloben-interface/enums';
import Joi from 'joi';

export const patchServerSettingsSchema = Joi.object({
  query: Joi.object(),
  params: Joi.object(),
  body: Joi.object().keys({
    checkNewVersion: Joi.boolean().optional(),
    emailCounter: Joi.number().integer().min(0).max(1000).optional(),
    locationProvider: Joi.string()
      .valid(LOCATION_PROVIDER.OPEN_STREET_MAPS, LOCATION_PROVIDER.GOOGLE_MAPS)
      .optional(),
    locationInModal: Joi.boolean().optional(),
  }),
});
