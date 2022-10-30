import { LOCATION_PROVIDER } from '../../../../data/types/enums';
import { Segments } from 'celebrate';
import Joi from 'joi';

export const patchServerSettingsSchema = {
  [Segments.BODY]: Joi.object().keys({
    checkNewVersion: Joi.boolean().optional(),
    emailCounter: Joi.number().integer().min(0).max(1000).optional(),
    locationProvider: Joi.string()
      .valid(LOCATION_PROVIDER.OPEN_STREET_MAPS, LOCATION_PROVIDER.GOOGLE_MAPS)
      .optional(),
    locationInModal: Joi.boolean().optional(),
  }),
};
