import { Router } from 'express';

import * as EventController from '../event/EventController';
import { RATE_LIMIT } from '../../utils/enums';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { emptySchema } from '../../common/schemas/emptySchema';
import { getEventsSchema } from './schemas/getEventsSchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const EventRoutes: Router = Router();

EventRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.GET_EVENTS),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(emptySchema),
  ],
  EventController.getCachedEvents
);

EventRoutes.get(
  '/range',
  [
    rateLimiterMiddleware(RATE_LIMIT.GET_EVENTS),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(getEventsSchema),
  ],
  EventController.getEventsInRange
);

export default EventRoutes;
