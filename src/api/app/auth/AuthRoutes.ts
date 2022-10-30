import { Router } from 'express';

import * as UserController from './AuthController';
import { RATE_LIMIT } from '../../../utils/enums';
import { USER_ROLE } from './UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { changePasswordRequestSchema } from './schemas/changePasswordRequestSchema';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { loginDemoRequestSchema } from './schemas/loginDemoRequestSchema';
import { loginRequestSchema } from './schemas/loginRequestSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import twoFactorRouter from './twoFactor/TwoFactorRoutes';

const AuthRoutes: Router = Router();

AuthRoutes.get(
  '/login',
  [rateLimiterMiddleware(RATE_LIMIT.GET_SESSION), celebrate(emptySchema)],
  UserController.getSession
);

AuthRoutes.post(
  '/login',
  [rateLimiterMiddleware(RATE_LIMIT.LOGIN), celebrate(loginRequestSchema)],
  UserController.loginAccount
);

AuthRoutes.get(
  '/login-demo',
  [rateLimiterMiddleware(RATE_LIMIT.LOGIN), celebrate(loginDemoRequestSchema)],
  UserController.loginDemo
);

AuthRoutes.post(
  '/change-password',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(changePasswordRequestSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  UserController.changePassword
);

AuthRoutes.delete(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(loginRequestSchema),
    authMiddleware,
    roleMiddleware([USER_ROLE.USER]),
  ],
  UserController.deleteUser
);
AuthRoutes.get(
  '/logout',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    celebrate(emptySchema),
    roleMiddleware([USER_ROLE.USER, USER_ROLE.DEMO]),
  ],
  UserController.logout
);

AuthRoutes.use('/two-factor', twoFactorRouter);

export default AuthRoutes;
