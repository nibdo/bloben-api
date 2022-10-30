import { Router } from 'express';

import * as EventController from './EventController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { getCachedEventsSchema } from './schemas/getCachedEventsSchema';
import { getEventSchema } from './schemas/getEventSchema';
import { getEventsSchema } from './schemas/getEventsSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { searchEventsSchema } from './schemas/searchEventsSchema';

const EventRoutes: Router = Router();

EventRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.GET_EVENTS),
    celebrate(getCachedEventsSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  EventController.getCachedEvents
);

EventRoutes.get(
  '/range',
  [
    rateLimiterMiddleware(RATE_LIMIT.GET_EVENTS),
    celebrate(getEventsSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  EventController.getEventsInRange
);

EventRoutes.get(
  '/search',
  [
    rateLimiterMiddleware(RATE_LIMIT.SEARCH_EVENTS),
    celebrate(searchEventsSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  EventController.searchEvents
);

EventRoutes.get(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(getEventSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  EventController.getEvent
);

export default EventRoutes;
