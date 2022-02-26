import { Router } from 'express';

import * as TimezoneController from './TimezoneController';
import { RATE_LIMIT } from '../../utils/enums';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { emptySchema } from '../../common/schemas/emptySchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const TimezoneRoutes: Router = Router();

TimezoneRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.TIMEZONE),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(emptySchema),
  ],
  TimezoneController.getTimezones
);

export default TimezoneRoutes;
