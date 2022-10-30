import { DAV_ACCOUNT_TYPE } from '../../../../data/types/enums';
import { Segments } from 'celebrate';
import Joi from 'joi';

export const createCalDavAccount = {
  [Segments.BODY]: Joi.object({
    username: Joi.string().min(1).required(),
    password: Joi.string().min(1).required(),
    url: Joi.string().min(1).required(),
    accountType: Joi.string()
      .valid(DAV_ACCOUNT_TYPE.CALDAV, DAV_ACCOUNT_TYPE.CARDDAV)
      .required(),
  }),
};
