import * as AdminController from './AdminController';
import { RATE_LIMIT } from '../../../utils/enums';
import { Router } from 'express';
import { USER_ROLE } from '../../app/auth/UserEnums';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { celebrate } from 'celebrate';
import { changeAdminPasswordSchema } from './schemas/changeAdminPasswordSchema';
import { emptySchema } from '../../../common/schemas/emptySchema';
import { loginAdminSchema } from './schemas/loginAdminSchema';
import { rateLimiterMiddleware } from '../../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../../middleware/roleMiddleware';
import { userMiddleware } from '../../../middleware/userMiddleware';
import AdminTwoFactorRouter from './twoFactor/AdminTwoFactorRoutes';

const AdminRoutes: Router = Router();

AdminRoutes.post(
  '/login',
  [rateLimiterMiddleware(RATE_LIMIT.ADMIN_LOGIN), celebrate(loginAdminSchema)],
  AdminController.loginAdmin
);

AdminRoutes.get(
  '/',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    userMiddleware,
    celebrate(emptySchema),
  ],
  AdminController.getAdminAccount
);

AdminRoutes.post(
  '/change-password',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    userMiddleware,
    celebrate(changeAdminPasswordSchema),
  ],
  AdminController.changePasswordAdmin
);

AdminRoutes.get(
  '/logout',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    authMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    userMiddleware,
    celebrate(emptySchema),
  ],
  AdminController.logoutAdmin
);

AdminRoutes.use('/two-factor', AdminTwoFactorRouter);

export default AdminRoutes;
