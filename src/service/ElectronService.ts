import { APP_DIR } from '../utils/constants';
import { DateTime } from 'luxon';
import { NODE_ENV } from '../utils/enums';
import { ROLE } from '../data/types/enums';
import { getRangeEventsFunc } from '../api/app/event/helpers/getInRangeHelper';
import { sortBy } from 'lodash';
import CalendarSettingsRepository from '../data/repository/CalendarSettingsRepository';
import UserRepository from '../data/repository/UserRepository';
import fs from 'fs';

export class ElectronService {
  protected isElectron = false;
  private fileName = 'widget.json';

  constructor(isElectron?: boolean) {
    if (isElectron) {
      this.isElectron = true;

      this.processWidgetFile();
    }
  }

  /**
   * Get events for today and tomorrow
   */
  public processWidgetFile = async () => {
    if (!this.isElectron || process.env.NODE_ENV === NODE_ENV.TEST) {
      return;
    }

    const user = await UserRepository.getRepository().findOne({
      where: { role: ROLE.USER },
    });

    if (!user) {
      return;
    }

    const calendarSettings =
      await CalendarSettingsRepository.getRepository().findOne({
        where: {
          userID: user.id,
        },
      });

    if (!calendarSettings) {
      return;
    }

    const date = DateTime.now().toUTC().toJSDate().toISOString();

    const baseDate = DateTime.fromISO(date, {
      zone: calendarSettings.timezone || 'UTC',
    }).startOf('day');

    const rangeStart = baseDate.toUTC().toString();
    const rangeEnd = DateTime.fromISO(date, {
      zone: calendarSettings.timezone || 'UTC',
    })
      .plus({ day: 2 })
      .endOf('day')
      .toUTC()
      .toString();

    const result = await getRangeEventsFunc(
      user.id,
      rangeStart,
      rangeEnd,
      true,
      false
    );

    const file = JSON.stringify(
      sortBy(result, 'startAt').map((item) => ({
        id: item.id,
        summary: item.summary,
        startAt: item.startAt,
        endAt: item.endAt,
        allDay: item.allDay,
        startTime: item.allDay
          ? 'All day'
          : DateTime.fromISO(item.startAt, {
              zone: item.timezoneStartAt || calendarSettings.timezone,
            }).toFormat('HH:mm'),
        endTime: item.allDay
          ? ''
          : DateTime.fromISO(item.endAt, {
              zone: item.timezoneEndAt || calendarSettings.timezone,
            }).toFormat('HH:mm'),
      }))
    );

    await fs.writeFileSync(`${APP_DIR}/${this.fileName}`, file);
  };
}
