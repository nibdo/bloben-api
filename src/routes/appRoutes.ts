import { Router } from 'express';

import AuthRouter from '../api/app/auth/AuthRoutes';
import CalDavAccountRouter from '../api/app/caldavAccount/CalDavAccountRoutes';
import CalDavCalendarRouter from '../api/app/calDavCalendar/CalDavCalendaRouter';
import CalDavEventRouter from '../api/app/calDavEvent/CalDavEventRoutes';
import CalDavTaskRoutes from '../api/app/calDavTask/CalDavTaskRoutes';
import CalDavTaskSettingsRoutes from '../api/app/calDavTaskSettings/CalDavTaskSettingsRoutes';
import CalendarRouter from '../api/app/calendar/CalendarRouter';
import CalendarSettingsRouter from '../api/app/calendarSettings/CalendarSettingsRouter';
import CardDavAddressBookRouter from '../api/app/cardDavAddressBooks/CardDavAddressBookRouter';
import CardDavContactRouter from '../api/app/cardDavContact/CardDavContactRouter';
import EventRoutes from '../api/app/event/EventRoutes';
import ServerSettingsRouter from '../api/admin/serverSettings/ServerSettingsRouter';
import SocketRouter from '../api/app/socket/SocketRoutes';
import SyncRouter from '../api/app/sync/SyncRoutes';
import TimezoneRouter from '../api/app/timezone/TimezoneRoutes';
import UserEmailConfigRoutes from '../api/app/userEmailConfig/UserEmailConfigRoutes';
import VersionRouter from '../api/app/version/VersionRoutes';
import WebcalCalendarRouter from '../api/app/webcalCalendar/WebcalCalendarRouter';
import WebcalEventsRouter from '../api/app/webcalEvents/WebcalEventRouter';

const AppRouter: Router = Router();

AppRouter.use(`/auth`, AuthRouter);
AppRouter.use(`/users/email-config`, UserEmailConfigRoutes);
AppRouter.use(`/socket`, SocketRouter);
AppRouter.use(`/caldav-events`, CalDavEventRouter);
AppRouter.use(`/events`, EventRoutes);
AppRouter.use(`/timezones`, TimezoneRouter);
AppRouter.use(`/caldav-accounts`, CalDavAccountRouter);
AppRouter.use(`/caldav-calendars`, CalDavCalendarRouter);
AppRouter.use(`/caldav-tasks`, CalDavTaskRoutes);
AppRouter.use(`/caldav-task/settings`, CalDavTaskSettingsRoutes);
AppRouter.use(`/webcal/calendars`, WebcalCalendarRouter);
AppRouter.use(`/webcal/events`, WebcalEventsRouter);
AppRouter.use(`/version`, VersionRouter);
AppRouter.use(`/sync`, SyncRouter);
AppRouter.use(`/calendar-settings`, CalendarSettingsRouter);
AppRouter.use(`/calendars`, CalendarRouter);
AppRouter.use(`/carddav/contacts`, CardDavContactRouter);
AppRouter.use(`/carddav/address-books`, CardDavAddressBookRouter);
AppRouter.use(`/server-settings`, ServerSettingsRouter);

export default AppRouter;
