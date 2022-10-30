import { RATE_LIMIT } from '../../../../utils/enums';
import { Router } from 'express';
import { USER_ROLE } from '../../auth/UserEnums';
import { authMiddleware } from '../../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { createSharedCalendar } from './handlers/createSharedCalendar';
import { createSharedCalendarSchema } from './schemas/createSharedCalendarSchema';
import { deleteSharedCalendar } from './handlers/deleteSharedCalendar';
import { emptySchema } from '../../../../common/schemas/emptySchema';
import { getSharedCalendar } from './handlers/getSharedCalendar';
import { getSharedCalendarSchema } from './schemas/getSharedCalendarSchema';
import { getSharedCalendars } from './handlers/getSharedCalendars';
import { patchSharedCalendar } from './handlers/patchSharedCalendar';
import { rateLimiterMiddleware } from '../../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../../middleware/roleMiddleware';
import { sendSharedCalendarInvite } from './handlers/sendSharedCalendarInvite';
import { sendSharedCalendarInviteSchema } from './schemas/sendSharedCalendarInviteSchema';
import { updateSharedCalendar } from './handlers/updateSharedCalendar';
import { updateSharedCalendarSchema } from './schemas/updateSharedCalendarSchema';
import { userMiddleware } from '../../../../middleware/userMiddleware';

const CalendarSharedRoutes: Router = Router();

CalendarSharedRoutes.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(createSharedCalendarSchema),
    authMiddleware,
    userMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  createSharedCalendar
);

CalendarSharedRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  getSharedCalendars
);

CalendarSharedRoutes.get(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(getSharedCalendarSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  getSharedCalendar
);

CalendarSharedRoutes.put(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(updateSharedCalendarSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  updateSharedCalendar
);

CalendarSharedRoutes.patch(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(getSharedCalendarSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  patchSharedCalendar
);

CalendarSharedRoutes.delete(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(getSharedCalendarSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  deleteSharedCalendar
);

CalendarSharedRoutes.post(
  '/:id/invite',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(sendSharedCalendarInviteSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  sendSharedCalendarInvite
);

export default CalendarSharedRoutes;
