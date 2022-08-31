import { Router } from 'express';

import AdminRouter from '../api/admin/auth/AdminRoutes';
import AdminUsersRouter from '../api/admin/users/AdminUsersRoutes';
import LogRouter from '../api/admin/logs/LogRoutes';
import ServerSettingsRouter from '../api/admin/serverSettings/ServerSettingsRouter';

const AdminRoutes: Router = Router();

AdminRoutes.use('/auth', AdminRouter);
AdminRoutes.use('/users', AdminUsersRouter);
AdminRoutes.use(`/logs`, LogRouter);
AdminRoutes.use(`/server-settings`, ServerSettingsRouter);

export default AdminRoutes;
