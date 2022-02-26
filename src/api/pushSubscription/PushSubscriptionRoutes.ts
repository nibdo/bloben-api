import { Router } from 'express';

import * as PushSubscriptionController from './PushSubscriptionController';
import { RATE_LIMIT } from '../../utils/enums';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { createPushSubscriptionSchema } from './schemas/createPushSubscriptionSchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { userMiddleware } from '../../middleware/userMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const SocketSessionRoutes: Router = Router();

SocketSessionRoutes.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    userMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(createPushSubscriptionSchema),
  ],
  PushSubscriptionController.createPushSubscription
);

export default SocketSessionRoutes;
