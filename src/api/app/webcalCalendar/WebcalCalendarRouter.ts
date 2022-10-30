import { Router } from 'express';

import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';

import * as WebcalCalendarController from './WebcalCalendarController';
import { celebrate } from 'celebrate';
import { createWebcalCalendarSchema } from './schemas/createWebcalCalendarSchema';
import { deleteWebcalCalendarSchema } from './schemas/deleteWebcalCalendarSchema';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { patchWebcalCalendarSchema } from './schemas/patchWebcalCalendarSchema';
import { updateWebcalCalendarSchema } from './schemas/updateWebcalCalendarSchema';

const WebcalCalendarRouter: Router = Router();

WebcalCalendarRouter.post(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(createWebcalCalendarSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  WebcalCalendarController.createWebcalCalendar
);

WebcalCalendarRouter.get(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  WebcalCalendarController.getWebcalCalendars
);
WebcalCalendarRouter.put(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(updateWebcalCalendarSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  WebcalCalendarController.updateWebcalCalendar
);
WebcalCalendarRouter.delete(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(deleteWebcalCalendarSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  WebcalCalendarController.deleteWebcalCalendar
);
WebcalCalendarRouter.patch(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(patchWebcalCalendarSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  WebcalCalendarController.patchWebcalCalendar
);

export default WebcalCalendarRouter;
