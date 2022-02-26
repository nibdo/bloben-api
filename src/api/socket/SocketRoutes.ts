import { Router } from 'express';

import * as SocketController from './SocketController';
import { RATE_LIMIT } from '../../utils/enums';
import { USER_ROLE } from '../user/UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { createSocketSessionSchema } from './schemas/createSocketSessionSchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const SocketSessionRoutes: Router = Router();

SocketSessionRoutes.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(createSocketSessionSchema),
  ],
  SocketController.createSocketSessionId
);

export default SocketSessionRoutes;
