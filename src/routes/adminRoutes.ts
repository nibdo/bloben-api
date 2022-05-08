import { Router } from 'express';

import AdminRouter from '../api/admin/AdminRoutes';
import AdminUsersRouter from '../api/adminUsers/AdminUsersRoutes';
import LogRouter from '../api/log/LogRoutes';
import ServerSettingsRouter from '../api/serverSettings/ServerSettingsRouter';

const AdminRoutes: Router = Router();

AdminRoutes.use('', AdminRouter);
AdminRoutes.use('/users', AdminUsersRouter);
AdminRoutes.use(`/logs`, LogRouter);
AdminRoutes.use(`/server-settings`, ServerSettingsRouter);

export default AdminRoutes;
