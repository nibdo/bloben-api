import { Router } from 'express';

import * as UserController from './UserController';
import { RATE_LIMIT } from '../../utils/enums';
import { USER_ROLE } from './UserEnums';
import { authMiddleware } from '../../middleware/authMiddleware';
import { changePasswordRequestSchema } from './schemas/changePasswordRequestSchema';
import { emptySchema } from '../../common/schemas/emptySchema';
import { loginDemoRequestSchema } from './schemas/loginDemoRequestSchema';
import { loginRequestSchema } from './schemas/loginRequestSchema';
import { loginWithTwoFactorSchema } from './schemas/loginWithTwoFactorSchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const UserRoutes: Router = Router();

UserRoutes.get(
  '/login',
  [
    rateLimiterMiddleware(RATE_LIMIT.GET_SESSION),
    validationMiddleware(emptySchema),
  ],
  UserController.getSession
);

UserRoutes.post(
  '/login',
  [
    rateLimiterMiddleware(RATE_LIMIT.LOGIN),
    validationMiddleware(loginRequestSchema),
  ],
  UserController.loginAccount
);

UserRoutes.get(
  '/login-demo',
  [
    rateLimiterMiddleware(RATE_LIMIT.LOGIN),
    validationMiddleware(loginDemoRequestSchema),
  ],
  UserController.loginDemo
);

UserRoutes.get(
  '/account',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(emptySchema),
  ],
  UserController.getAccount
);

UserRoutes.post(
  '/2fa/login',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(loginWithTwoFactorSchema),
  ],
  UserController.loginWithTwoFactor
);

UserRoutes.post(
  '/change-password',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(changePasswordRequestSchema),
  ],
  UserController.changePassword
);

UserRoutes.delete(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(loginRequestSchema),
  ],
  UserController.deleteUser
);
UserRoutes.get(
  '/logout',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(emptySchema),
  ],
  UserController.logout
);
UserRoutes.get(
  '/2fa/generate',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(emptySchema),
  ],
  UserController.generateTwoFactor
);
UserRoutes.get(
  '/2fa',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(emptySchema),
  ],
  UserController.getTwoFactor
);
UserRoutes.post(
  '/2fa',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(loginWithTwoFactorSchema),
  ],
  UserController.enableTwoFactor
);
UserRoutes.delete(
  '/2fa',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(emptySchema),
  ],
  UserController.deleteTwoFactor
);

export default UserRoutes;
