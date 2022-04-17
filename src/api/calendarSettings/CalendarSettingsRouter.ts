import * as CalendarSettingsController from './CalendarSettingsController';
import { RATE_LIMIT } from '../../utils/enums';
import { Router } from 'express';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { emptySchema } from '../../common/schemas/emptySchema';
import { patchCalendarSettingsSchema } from './schemas/patchCalendarSettingsSchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const CalendarSettingsRoutes: Router = Router();

CalendarSettingsRoutes.patch(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.UPDATE_SETTINGS),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(patchCalendarSettingsSchema),
  ],
  CalendarSettingsController.patchCalendarSettings
);

CalendarSettingsRoutes.get(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.UPDATE_SETTINGS),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(emptySchema),
  ],
  CalendarSettingsController.getCalendarSettings
);

export default CalendarSettingsRoutes;
