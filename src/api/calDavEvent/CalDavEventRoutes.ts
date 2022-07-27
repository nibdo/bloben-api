import { Router } from 'express';

import * as CalDavEventController from './CalDavEventController';
import { RATE_LIMIT } from '../../utils/enums';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { createCalDavEventSchema } from './schemas/createCalDavEventSchema';
import { deleteCalDavEventSchema } from './schemas/deleteCalDavEventSchema';
import { deleteRepeatedCalDavEventSchema } from './schemas/deleteRepeatedCalDavEventSchema';
import { duplicateMultipleCalDavEvents } from './handlers/duplicateMultipleCalDavEvents';
import { duplicateMultipleCalDavEventsSchema } from './schemas/duplicateMultipleCalDavEventsSchema';
import { getCalDavEventSchema } from './schemas/getCalDavEventSchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { syncRequestSchema } from '../../common/schemas/syncRequestSchema';
import { updateCalDavEventSchema } from './schemas/updateCalDavEventSchema';
import { updatePartstatStatusSchema } from './schemas/updatePartstatStatusSchema';
import { updateRepeatedCalDavEventSchema } from './schemas/updateRepeatedCalDavEventSchema';
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
  '/repeated',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(updateRepeatedCalDavEventSchema),
  ],
  CalDavEventController.updateRepeatedCalDavEvent
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
  '/repeated',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(deleteRepeatedCalDavEventSchema),
  ],
  CalDavEventController.deleteRepeatedCalDavEvent
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
CalDavEventRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(getCalDavEventSchema),
  ],
  CalDavEventController.getCalDavEvent
);
CalDavEventRoutes.patch(
  '/:eventID',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(updatePartstatStatusSchema),
  ],
  CalDavEventController.updatePartstatStatus
);

CalDavEventRoutes.post(
  '/:eventID/duplicate',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(duplicateMultipleCalDavEventsSchema),
  ],
  duplicateMultipleCalDavEvents
);

export default CalDavEventRoutes;
