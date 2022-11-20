import { Router } from 'express';

import * as CalDavEventController from './CalDavEventController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { createCalDavEventSchema } from './schemas/createCalDavEventSchema';
import { deleteCalDavEventSchema } from './schemas/deleteCalDavEventSchema';
import { deleteRepeatedCalDavEventSchema } from './schemas/deleteRepeatedCalDavEventSchema';
import { duplicateMultipleCalDavEvents } from './handlers/duplicateMultipleCalDavEvents';
import { duplicateMultipleCalDavEventsSchema } from './schemas/duplicateMultipleCalDavEventsSchema';
import { getCalDavEventSchema } from './schemas/getCalDavEventSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { updateCalDavEventSchema } from './schemas/updateCalDavEventSchema';
import { updatePartstatStatusRepeatedEventSchema } from './schemas/updatePartstatStatusRepeatedEventSchema';
import { updatePartstatStatusSchema } from './schemas/updatePartstatStatusSchema';
import { updateRepeatedCalDavEventSchema } from './schemas/updateRepeatedCalDavEventSchema';

const CalDavEventRoutes: Router = Router();

CalDavEventRoutes.put(
  '/repeated',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(updateRepeatedCalDavEventSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavEventController.updateRepeatedCalDavEvent
);
CalDavEventRoutes.put(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(updateCalDavEventSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavEventController.updateCalDavEvent
);

CalDavEventRoutes.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(createCalDavEventSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavEventController.createCalDavEvent
);
CalDavEventRoutes.delete(
  '/repeated',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(deleteRepeatedCalDavEventSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavEventController.deleteRepeatedCalDavEvent
);
CalDavEventRoutes.delete(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(deleteCalDavEventSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavEventController.deleteCalDavEvent
);
CalDavEventRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(getCalDavEventSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavEventController.getCalDavEvent
);

CalDavEventRoutes.patch(
  '/:eventID/repeated',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(updatePartstatStatusRepeatedEventSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavEventController.updatePartstatStatusRepeatedEvent
);

CalDavEventRoutes.patch(
  '/:eventID',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(updatePartstatStatusSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavEventController.updatePartstatStatus
);

CalDavEventRoutes.post(
  '/:eventID/duplicate',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(duplicateMultipleCalDavEventsSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  duplicateMultipleCalDavEvents
);

export default CalDavEventRoutes;
