import { Router } from 'express';

import * as CalDavTaskController from './CalDavTaskController';
import { RATE_LIMIT } from '../../utils/enums';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { createCalDavEventSchema } from '../calDavEvent/schemas/createCalDavEventSchema';
import { deleteCalDavEventSchema } from '../calDavEvent/schemas/deleteCalDavEventSchema';
import { emptySchema } from '../../common/schemas/emptySchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { updateCalDavEventSchema } from '../calDavEvent/schemas/updateCalDavEventSchema';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const CalDavTaskRoutes: Router = Router();

CalDavTaskRoutes.get(
  '/sync',
  [
    rateLimiterMiddleware(RATE_LIMIT.SYNC),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(emptySchema),
  ],
  CalDavTaskController.syncCalDavTasks
);

CalDavTaskRoutes.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(createCalDavEventSchema),
  ],
  CalDavTaskController.createCalDavTask
);

CalDavTaskRoutes.delete(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(deleteCalDavEventSchema),
  ],
  CalDavTaskController.deleteCalDavTask
);

CalDavTaskRoutes.put(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(updateCalDavEventSchema),
  ],
  CalDavTaskController.updateCalDavTask
);

CalDavTaskRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(emptySchema),
  ],
  CalDavTaskController.getCalDavTasks
);

export default CalDavTaskRoutes;
