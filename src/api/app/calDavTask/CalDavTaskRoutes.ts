import { Router } from 'express';

import * as CalDavTaskController from './CalDavTaskController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { getCalDavTasksSchema } from './schemas/getCalDavTasksSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';

const CalDavTaskRoutes: Router = Router();

CalDavTaskRoutes.get(
  '/latest',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  CalDavTaskController.getLatestCalDavTasks
);

CalDavTaskRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(getCalDavTasksSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  CalDavTaskController.getCalDavTasks
);

export default CalDavTaskRoutes;
