import { Router } from 'express';

import * as CalDavCalendarController from './CalDavCalendarController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { createCalDavCalendarSchema } from './schemas/createCalDavCalendarSchema';
import { deleteCalDavCalendarSchema } from './schemas/deleteCalDavCalendarSchema';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { getCalDavCalendarSchema } from './schemas/getCalDavCalendarSchema';
import { patchCalDavCalendarSchema } from './schemas/patchCalDavCalendarSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { updateCalDavCalendarSchema } from './schemas/updateCalDavCalendarSchema';

const CalDavACalendarRouter: Router = Router();

CalDavACalendarRouter.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(getCalDavCalendarSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  CalDavCalendarController.getCalDavCalendars
);

CalDavACalendarRouter.post(
  '/sync',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavCalendarController.syncCalDavCalendars
);

CalDavACalendarRouter.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(createCalDavCalendarSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavCalendarController.createCalDavCalendar
);

CalDavACalendarRouter.put(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(updateCalDavCalendarSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavCalendarController.updateCalDavCalendar
);

CalDavACalendarRouter.patch(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(patchCalDavCalendarSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavCalendarController.patchCalDavCalendar
);

CalDavACalendarRouter.delete(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(deleteCalDavCalendarSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  CalDavCalendarController.deleteCalDavCalendar
);

export default CalDavACalendarRouter;
