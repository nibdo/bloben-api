import * as CalendarSettingsController from './CalendarSettingsController';
import { RATE_LIMIT } from '../../../utils/enums';
import { Router } from 'express';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { patchCalendarSettingsSchema } from './schemas/patchCalendarSettingsSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';

const CalendarSettingsRoutes: Router = Router();

CalendarSettingsRoutes.patch(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.UPDATE_SETTINGS),
    celebrate(patchCalendarSettingsSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalendarSettingsController.patchCalendarSettings
);

CalendarSettingsRoutes.get(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.UPDATE_SETTINGS),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  CalendarSettingsController.getCalendarSettings
);

export default CalendarSettingsRoutes;
