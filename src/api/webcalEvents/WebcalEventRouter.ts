import { Router } from 'express';

import * as WebcalEventController from './WebcalEventController';
import { RATE_LIMIT } from '../../utils/enums';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { emptySchema } from '../../common/schemas/emptySchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const WebcalEventRouter: Router = Router();

WebcalEventRouter.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(emptySchema),
  ],
  WebcalEventController.getWebcalEvents
);

export default WebcalEventRouter;
