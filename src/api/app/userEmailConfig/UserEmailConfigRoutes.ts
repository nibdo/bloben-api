import { Router } from 'express';

import * as UserEmailConfigController from './UserEmailConfigController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { updateUserEmailConfigSchema } from './schemas/UpdateUserEmailConfigSchema';
import { userMiddleware } from '../../../middleware/userMiddleware';

const UserEmailConfigRoutes: Router = Router();

UserEmailConfigRoutes.patch(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(updateUserEmailConfigSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  UserEmailConfigController.updateUserEmailConfig
);

UserEmailConfigRoutes.get(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  UserEmailConfigController.getUserEmailConfig
);

UserEmailConfigRoutes.delete(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    userMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  UserEmailConfigController.deleteUserEmailConfig
);

export default UserEmailConfigRoutes;
