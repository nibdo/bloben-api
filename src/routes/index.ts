import { Router } from 'express';

import { API_VERSIONS } from '../utils/enums';
import CalDavAccountRouter from '../api/caldavAccount/CalDavAccountRoutes';
import CalDavCalendarRouter from '../api/calDavCalendar/CalDavCalendaRouter';
import CalDavEventRouter from '../api/calDavEvent/CalDavEventRoutes';
import CalDavEventRouterV2 from '../api/calDavEvent/CalDavEventRoutesV2';
import CalDavTaskRoutes from '../api/calDavTask/CalDavTaskRoutes';
import CalDavTaskSettingsRoutes from '../api/calDavTaskSettings/CalDavTaskSettingsRoutes';
import CalendarSettingsRouter from '../api/calendarSettings/CalendarSettingsRouter';
import EventRoutes from '../api/event/EventRoutes';
import ServerSettingsRouter from '../api/serverSettings/ServerSettingsRouter';
import SocketRouter from '../api/socket/SocketRoutes';
import SyncRouter from '../api/sync/SyncRoutes';
import TimezoneRouter from '../api/timezone/TimezoneRoutes';
import UserEmailConfigRoutes from '../api/userEmailConfig/UserEmailConfigRoutes';
import UserRouter from '../api/user/UserRoutes';
import VersionRouter from '../api/version/VersionRoutes';
import WebcalCalendarRouter from '../api/webcalCalendar/WebcalCalendarRouter';
import WebcalEventsRouter from '../api/webcalEvents/WebcalEventRouter';

const AppRouter: Router = Router();

AppRouter.use(`/${API_VERSIONS.V1}/users`, UserRouter);
AppRouter.use(`/${API_VERSIONS.V1}/users/email-config`, UserEmailConfigRoutes);
AppRouter.use(`/${API_VERSIONS.V1}/socket`, SocketRouter);
AppRouter.use(`/${API_VERSIONS.V1}/caldav-events`, CalDavEventRouter);
AppRouter.use(`/${API_VERSIONS.V2}/caldav-events`, CalDavEventRouterV2);
AppRouter.use(`/${API_VERSIONS.V1}/events`, EventRoutes);
AppRouter.use(`/${API_VERSIONS.V1}/timezones`, TimezoneRouter);
AppRouter.use(`/${API_VERSIONS.V1}/caldav-accounts`, CalDavAccountRouter);
AppRouter.use(`/${API_VERSIONS.V1}/caldav-calendars`, CalDavCalendarRouter);
AppRouter.use(`/${API_VERSIONS.V1}/caldav-tasks`, CalDavTaskRoutes);
AppRouter.use(
  `/${API_VERSIONS.V1}/caldav-task/settings`,
  CalDavTaskSettingsRoutes
);
AppRouter.use(`/${API_VERSIONS.V1}/webcal/calendars`, WebcalCalendarRouter);
AppRouter.use(`/${API_VERSIONS.V1}/webcal/events`, WebcalEventsRouter);
AppRouter.use(`/${API_VERSIONS.V1}/version`, VersionRouter);
AppRouter.use(`/${API_VERSIONS.V1}/sync`, SyncRouter);
AppRouter.use(`/${API_VERSIONS.V1}/calendar-settings`, CalendarSettingsRouter);
AppRouter.use(`/${API_VERSIONS.V1}/server-settings`, ServerSettingsRouter);

export default AppRouter;
