import { Router } from 'express';

import * as EventController from './EventController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { getCachedEventsSchema } from './schemas/getCachedEventsSchema';
import { getEventSchema } from './schemas/getEventSchema';
import { getEventsSchema } from './schemas/getEventsSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { searchEventsSchema } from './schemas/searchEventsSchema';
import { validationMiddleware } from '../../../middleware/validationMiddleware';

const EventRoutes: Router = Router();

EventRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.GET_EVENTS),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(getCachedEventsSchema),
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

EventRoutes.get(
  '/search',
  [
    rateLimiterMiddleware(RATE_LIMIT.SEARCH_EVENTS),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(searchEventsSchema),
  ],
  EventController.searchEvents
);

EventRoutes.get(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(getEventSchema),
  ],
  EventController.getEvent
);

export default EventRoutes;
