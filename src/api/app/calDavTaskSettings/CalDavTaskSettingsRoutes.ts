import { Router } from 'express';

import * as CalDavTaskSettingsController from './CalDavTaskSettingsController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { updateCalDavTaskSettingsSchema } from './schemas/updateCalDavTaskSettingsSchema';

import { celebrate } from 'celebrate';

const CalDavTaskSettingsRoutes: Router = Router();

CalDavTaskSettingsRoutes.put(
  '/:calendarID',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(updateCalDavTaskSettingsSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavTaskSettingsController.updateCalDavTaskSettings
);

CalDavTaskSettingsRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  CalDavTaskSettingsController.getCalDavTaskSettings
);

export default CalDavTaskSettingsRoutes;
