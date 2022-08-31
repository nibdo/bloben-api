import { RATE_LIMIT } from '../../../utils/enums';
import { Router } from 'express';
import { getPublicCalendarSchema } from './schemas/getPublicCalendarSchema';
import { getPublicCalendars } from './handlers/getPublicCalendars';
import { getPublicEventsInRange } from './handlers/getPublicEventsInRange';
import { getPublicEventsInRangeSchema } from './schemas/getPublicEventsInRangeSchema';
import { getPublicSharedLink } from './handlers/getPublicSharedLink';
import { publicLinkMiddleware } from '../../../middleware/publicLinkMiddleware';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { searchPublicEvents } from './handlers/searchPublicEvents';
import { searchPublicEventsSchema } from './schemas/searchPublicEventsSchema';
import { validationMiddleware } from '../../../middleware/validationMiddleware';

const PublicRoutes: Router = Router();

PublicRoutes.get(
  `/:id/events`,
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    validationMiddleware(getPublicEventsInRangeSchema),
    publicLinkMiddleware,
  ],
  getPublicEventsInRange
);

PublicRoutes.get(
  `/:id/calendars`,
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    validationMiddleware(getPublicCalendarSchema),
    publicLinkMiddleware,
  ],
  getPublicCalendars
);

PublicRoutes.get(
  `/:id/search`,
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    validationMiddleware(searchPublicEventsSchema),
    publicLinkMiddleware,
  ],
  searchPublicEvents
);

PublicRoutes.get(
  `/:id`,
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    validationMiddleware(getPublicCalendarSchema),
    publicLinkMiddleware,
  ],
  getPublicSharedLink
);

export default PublicRoutes;
