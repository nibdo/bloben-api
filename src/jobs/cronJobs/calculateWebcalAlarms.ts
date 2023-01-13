import { CalendarAlarms } from 'bloben-interface';
import { QueueClient } from '../../service/init';
import WebcalCalendarRepository from '../../data/repository/WebcalCalendarRepository';
import logger from '../../utils/logger';

interface WebcalCalendar {
  id: string;
  alarms: CalendarAlarms[];
  userID: string;
}

export const calculateWebcalAlarms = async () => {
  try {
    const webcalCalendars: WebcalCalendar[] =
      await WebcalCalendarRepository.getRepository().manager.query(
        `
      SELECT
        wc.id as id,
        wc.alarms as "alarms"
      FROM webcal_calendars wc
      WHERE 
        wc.deleted_at IS NULL
        AND wc.alarms IS NOT NULL
        `
      );

    if (!webcalCalendars.length) {
      return;
    }

    // schedule sync job for each user
    for (const webcalCalendar of webcalCalendars) {
      await QueueClient.webcalReminders(webcalCalendar.id);
    }
  } catch (e) {
    logger.error('[CRON]: Calculate webcal reminders error', e);
  }
};
