import { Router } from 'express';

import * as CalDavCalendarController from './CalDavCalendarController';
import { RATE_LIMIT } from '../../utils/enums';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { createCalDavCalendarSchema } from './schemas/createCalDavCalendarSchema';
import { deleteCalDavCalendarSchema } from './schemas/deleteCalDavCalendarSchema';
import { emptySchema } from '../../common/schemas/emptySchema';
import { getCalDavCalendarSchema } from './schemas/getCalDavCalendarSchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const CalDavACalendarRouter: Router = Router();

CalDavACalendarRouter.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(getCalDavCalendarSchema),
  ],
  CalDavCalendarController.getCalDavCalendars
);

CalDavACalendarRouter.post(
  '/sync',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(emptySchema),
  ],
  CalDavCalendarController.syncCalDavCalendars
);

CalDavACalendarRouter.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(createCalDavCalendarSchema),
  ],
  CalDavCalendarController.createCalDavCalendar
);

// CalDavACalendarRouter.put(
//   '/:id',
//   [
//     rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
//     authMiddleware,
//     roleMiddleware([USER_ROLE.USER]),
//     validationMiddleware(updateCalDavCalendarSchema),
//   ],
//   CalDavCalendarController.updateCalDavCalendar
// );

CalDavACalendarRouter.delete(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(deleteCalDavCalendarSchema),
  ],
  CalDavCalendarController.deleteCalDavCalendar
);

export default CalDavACalendarRouter;
