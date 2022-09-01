import { Connection, getConnection } from 'typeorm';

import { CreateWebcalCalendarRequest } from 'bloben-interface';
import UserEntity from '../../../data/entity/UserEntity';
import WebcalCalendarEntity from '../../../data/entity/WebcalCalendarEntity';
import WebcalEventEntity from '../../../data/entity/WebcalEventEntity';

export const webcalTestData: CreateWebcalCalendarRequest = {
  name: 'Test cal',
  color: 'indigo',
  url: 'http://localhost:3000',
  syncFrequency: 180,
  alarms: [],
  userMailto: null,
};

export const createWebcalCalendars = async (userID: string) => {
  const connection: Connection = await getConnection();

  const user: UserEntity | undefined = await connection.manager.findOne(
    UserEntity,
    {
      where: {
        id: userID,
      },
    }
  );

  const webcalCalendar: WebcalCalendarEntity = new WebcalCalendarEntity(
    webcalTestData,
    user
  );

  await connection.manager.save(webcalCalendar);

  const webcalEvent: WebcalEventEntity = new WebcalEventEntity().setData(
    {
      begin: 'VEVENT',
      end: 'VEVENT',
      summary: 'Test',
      description: '',
      location: '',
      sequence: '1',
      dtstart: { value: '2021-11-07T18:40:00.000Z' },
      dtend: { value: '2021-11-07T22:00:00.000Z' },
      rrule: null,
      lastModified: { value: '2021-11-07T16:30:00.000Z' },
      uid: 'asfaf',
    },
    'Europe/Berlin',
    webcalCalendar
  );

  await connection.manager.save(webcalEvent);

  return webcalCalendar;
};

export const seedWebcal = async (userID): Promise<WebcalCalendarEntity> => {
  return createWebcalCalendars(userID);
};
