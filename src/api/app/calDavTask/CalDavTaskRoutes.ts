import { Router } from 'express';

import * as CalDavTaskController from './CalDavTaskController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { getCalDavTasksSchema } from './schemas/getCalDavTasksSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { validationMiddleware } from '../../../middleware/validationMiddleware';

const CalDavTaskRoutes: Router = Router();

CalDavTaskRoutes.get(
  '/latest',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(emptySchema),
  ],
  CalDavTaskController.getLatestCalDavTasks
);

CalDavTaskRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(getCalDavTasksSchema),
  ],
  CalDavTaskController.getCalDavTasks
);

export default CalDavTaskRoutes;
