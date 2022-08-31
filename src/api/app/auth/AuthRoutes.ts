import { Router } from 'express';

import * as UserController from './AuthController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from './UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { changePasswordRequestSchema } from './schemas/changePasswordRequestSchema';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { loginDemoRequestSchema } from './schemas/loginDemoRequestSchema';
import { loginRequestSchema } from './schemas/loginRequestSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { validationMiddleware } from '../../../middleware/validationMiddleware';
import twoFactorRouter from './twoFactor/TwoFactorRoutes';

const AuthRoutes: Router = Router();

AuthRoutes.get(
  '/login',
  [
    rateLimiterMiddleware(RATE_LIMIT.GET_SESSION),
    validationMiddleware(emptySchema),
  ],
  UserController.getSession
);

AuthRoutes.post(
  '/login',
  [
    rateLimiterMiddleware(RATE_LIMIT.LOGIN),
    validationMiddleware(loginRequestSchema),
  ],
  UserController.loginAccount
);

AuthRoutes.get(
  '/login-demo',
  [
    rateLimiterMiddleware(RATE_LIMIT.LOGIN),
    validationMiddleware(loginDemoRequestSchema),
  ],
  UserController.loginDemo
);

AuthRoutes.get(
  '/account',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(emptySchema),
  ],
  UserController.getAccount
);

AuthRoutes.post(
  '/change-password',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(changePasswordRequestSchema),
  ],
  UserController.changePassword
);

AuthRoutes.delete(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
    validationMiddleware(loginRequestSchema),
  ],
  UserController.deleteUser
);
AuthRoutes.get(
  '/logout',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
    validationMiddleware(emptySchema),
  ],
  UserController.logout
);

AuthRoutes.use('/two-factor', twoFactorRouter);

export default AuthRoutes;
