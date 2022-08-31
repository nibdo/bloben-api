import { Router } from 'express';

import * as UserController from './TwoFactorController';
import { RATE_LIMIT } from '../../../../utils/enums';
import { USER_ROLE } from '../UserEnums';
import { authMiddleware } from '../../../../middleware/authMiddleware';
import { emptySchema } from '../../../../common/schemas/emptySchema';
import { enableTwoFactorSchema } from '../../../admin/auth/twoFactor/schemas/enableTwoFactorSchema';
import { loginWithTwoFactorSchema } from '../../../admin/auth/twoFactor/schemas/loginWithTwoFactorSchema';
import { rateLimiterMiddleware } from '../../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../../middleware/roleMiddleware';
import { validationMiddleware } from '../../../../middleware/validationMiddleware';

const TwoFactorRoutes: Router = Router();

TwoFactorRoutes.post(
  '/login',
  [
    rateLimiterMiddleware(RATE_LIMIT.LOGIN),
    validationMiddleware(loginWithTwoFactorSchema),
  ],
  UserController.loginWithTwoFactor
);

TwoFactorRoutes.post(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(emptySchema),
  ],
  UserController.generateTwoFactor
);

TwoFactorRoutes.post(
  '/enable',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(enableTwoFactorSchema),
  ],
  UserController.enableTwoFactor
);

TwoFactorRoutes.delete(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(emptySchema),
  ],
  UserController.deleteTwoFactor
);

export default TwoFactorRoutes;
