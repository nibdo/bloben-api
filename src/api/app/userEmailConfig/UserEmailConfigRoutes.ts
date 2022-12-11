import { Router } from 'express';

import * as UserEmailConfigController from './UserEmailConfigController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from '../auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { createUserEmailConfigSchema } from './schemas/CreateUserEmailConfigSchema';
import { deleteUserEmailConfigSchema } from './schemas/DeleteUserEmailConfigSchema';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { patchUserEmailConfigSchema } from './schemas/PatchUserEmailConfigSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { updateUserEmailConfigSchema } from './schemas/UpdateUserEmailConfigSchema';

const UserEmailConfigRoutes: Router = Router();

UserEmailConfigRoutes.post(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(createUserEmailConfigSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  UserEmailConfigController.createUserEmailConfig
);

UserEmailConfigRoutes.put(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(updateUserEmailConfigSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  UserEmailConfigController.updateUserEmailConfig
);

UserEmailConfigRoutes.patch(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(patchUserEmailConfigSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  UserEmailConfigController.patchUserEmailConfig
);

UserEmailConfigRoutes.get(
  '',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  UserEmailConfigController.getUserEmailConfigs
);

UserEmailConfigRoutes.delete(
  '/:id',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(deleteUserEmailConfigSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  UserEmailConfigController.deleteUserEmailConfig
);

export default UserEmailConfigRoutes;
