import { Router } from 'express';

import * as CalDavEventController from './CalDavEventController';
import { RATE_LIMIT } from '../../utils/enums';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { createCalDavEventSchema } from './schemas/createCalDavEventSchema';
import { deleteCalDavEventSchema } from './schemas/deleteCalDavEventSchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { syncRequestSchema } from '../../common/schemas/syncRequestSchema';
import { updateCalDavEventSchema } from './schemas/updateCalDavEventSchema';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const CalDavEventRoutes: Router = Router();

CalDavEventRoutes.get(
  '/sync',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(syncRequestSchema),
  ],
  CalDavEventController.syncCalDavEvents
);

CalDavEventRoutes.put(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(updateCalDavEventSchema),
  ],
  CalDavEventController.updateCalDavEvent
);

CalDavEventRoutes.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(createCalDavEventSchema),
  ],
  CalDavEventController.createCalDavEvent
);
CalDavEventRoutes.delete(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(deleteCalDavEventSchema),
  ],
  CalDavEventController.deleteCalDavEvent
);

export default CalDavEventRoutes;
