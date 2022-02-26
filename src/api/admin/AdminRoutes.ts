import * as AdminController from './AdminController';
import { RATE_LIMIT } from '../../utils/enums';
import { Router } from 'express';
import { USER_ROLE } from '../user/UserEnums';
import { adminTokenMiddleware } from '../../middleware/adminTokenMiddleware';
import { changeAdminPasswordSchema } from './schemas/changeAdminPasswordSchema';
import { emptySchema } from '../../common/schemas/emptySchema';
import { loginAdminSchema } from './schemas/loginAdminSchema';
import { rateLimiterMiddleware } from '../../middleware/rateLimiterMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';
import { userMiddleware } from '../../middleware/userMiddleware';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const AdminRoutes: Router = Router();

AdminRoutes.post(
  '/login',
  [
    rateLimiterMiddleware(RATE_LIMIT.ADMIN_LOGIN),
    validationMiddleware(loginAdminSchema),
  ],
  AdminController.loginAdmin
);

AdminRoutes.get(
  '/login',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    adminTokenMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    userMiddleware,
    validationMiddleware(emptySchema),
  ],
  AdminController.getAdminAccount
);

AdminRoutes.post(
  '/change-password',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    adminTokenMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    userMiddleware,
    validationMiddleware(changeAdminPasswordSchema),
  ],
  AdminController.changePasswordAdmin
);

AdminRoutes.get(
  '/logout',
  [
    rateLimiterMiddleware(RATE_LIMIT.DEFAULT),
    adminTokenMiddleware,
    roleMiddleware([USER_ROLE.ADMIN]),
    userMiddleware,
    validationMiddleware(emptySchema),
  ],
  AdminController.logoutAdmin
);

export default AdminRoutes;
