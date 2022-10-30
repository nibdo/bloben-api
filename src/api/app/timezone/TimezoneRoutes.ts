import { Router } from 'express';

import * as TimezoneController from './TimezoneController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';

const TimezoneRoutes: Router = Router();

TimezoneRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.TIMEZONE),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  TimezoneController.getTimezones
);

export default TimezoneRoutes;
