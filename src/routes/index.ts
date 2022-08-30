import { Router } from 'express';

import CalDavAccountRouter from '../api/caldavAccount/CalDavAccountRoutes';
import CalDavCalendarRouter from '../api/calDavCalendar/CalDavCalendaRouter';
import CalDavEventRouter from '../api/calDavEvent/CalDavEventRoutes';
import CalDavTaskRoutes from '../api/calDavTask/CalDavTaskRoutes';
import CalDavTaskSettingsRoutes from '../api/calDavTaskSettings/CalDavTaskSettingsRoutes';
import CalendarRouter from '../api/calendar/CalendarRouter';
import CalendarSettingsRouter from '../api/calendarSettings/CalendarSettingsRouter';
import CardDavAddressBookRouter from '../api/cardDavAddressBooks/CardDavAddressBookRouter';
import CardDavContactRouter from '../api/cardDavContact/CardDavContactRouter';
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

AppRouter.use(`/users`, UserRouter);
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
