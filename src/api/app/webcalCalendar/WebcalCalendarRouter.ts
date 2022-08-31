import { Router } from 'express';

import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { validationMiddleware } from '../../../middleware/validationMiddleware';

import * as WebcalCalendarController from './WebcalCalendarController';
import { createWebcalCalendarSchema } from './schemas/createWebcalCalendarSchema';
import { deleteWebcalCalendarSchema } from './schemas/deleteWebcalCalendarSchema';
import { getWebcalCalendarSchema } from './schemas/getWebcalCalendarSchema';
import { patchWebcalCalendarSchema } from './schemas/patchWebcalCalendarSchema';
import { updateWebcalCalendarSchema } from './schemas/updateWebcalCalendarSchema';

const WebcalCalendarRouter: Router = Router();

WebcalCalendarRouter.post(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(createWebcalCalendarSchema),
  ],
  WebcalCalendarController.createWebcalCalendar
);

WebcalCalendarRouter.get(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(getWebcalCalendarSchema),
  ],
  WebcalCalendarController.getWebcalCalendars
);
WebcalCalendarRouter.put(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(updateWebcalCalendarSchema),
  ],
  WebcalCalendarController.updateWebcalCalendar
);
WebcalCalendarRouter.delete(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(deleteWebcalCalendarSchema),
  ],
  WebcalCalendarController.deleteWebcalCalendar
);
WebcalCalendarRouter.patch(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(patchWebcalCalendarSchema),
  ],
  WebcalCalendarController.patchWebcalCalendar
);

export default WebcalCalendarRouter;
