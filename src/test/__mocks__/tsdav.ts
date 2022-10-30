import { DAVAccount, DAVCalendar } from 'tsdav';
import { ImportMock } from 'ts-mock-imports';
import { testIcalString } from '../integration/seeds/calDavEvents';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsdav = require('tsdav');

export const mockTsDav = () => {
  ImportMock.restore();

  tsdav.fetchCalendars = () => {
    return [
      {
        components: ['VEVENT', 'VTODO'],
        ctag: 'ABCDE',
        displayName: 'default',
        url: 'cal',
      } as DAVCalendar,
    ];
  };

  tsdav.createVCard = () => ({
    status: 200,
    etag: 'ABCDE',
    url: 'card',
  });

  tsdav.deleteVCard = () => ({
    status: 200,
  });

  tsdav.createCalendarObject = () => ({
    url: 'http://localhost:8012/test',
  });

  tsdav.deleteObject = () => ({
    status: 204,
  });

  tsdav.makeCalendar = () => [
    {
      ok: true,
    },
  ];

  tsdav.updateCalendarObject = () => ({
    url: 'http://localhost:8012/test',
  });

  tsdav.fetchCalendarObjects = () => [
    {
      data: testIcalString,
      etag: 'ABCDE123',
      url: 'http://localhost:8012/test',
    },
  ];

  tsdav.deleteCalendarObject = () => ({});

  const MOCK_URL = 'http://localhost';

  tsdav.createAccount = () => {
    return {
      accountType: 'caldav',
      serverUrl: MOCK_URL,
      credentials: {
        username: 'test',
        password: 'test',
      },
      rootUrl: MOCK_URL,
      principalUrl: MOCK_URL,
      homeUrl: MOCK_URL,
      calendars: [
        {
          components: ['VEVENT', 'VTODO'],
          ctag: 'ABCDE',
          displayName: 'default',
          url: 'cal',
        },
      ],
    };
  };
  // return mockManager;
};

export const mockTsDavEvent = (icalString: string) => {
  ImportMock.restore();

  tsdav.fetchCalendars = () => [
    {
      components: ['VEVENT', 'VTODO'],
      ctag: 'ABCDE',
      displayName: 'default',
      url: 'cal',
    } as DAVCalendar,
  ];

  tsdav.createCalendarObject = () => ({
    url: 'http://localhost:8012/test',
  });

  tsdav.deleteObject = () => ({
    status: 204,
  });

  tsdav.makeCalendar = () => [
    {
      ok: true,
    },
  ];

  tsdav.updateCalendarObject = () => ({
    url: 'http://localhost:8012/test',
  });

  tsdav.fetchCalendarObjects = () => [
    {
      data: icalString,
      etag: 'ABCDE123',
      url: 'http://localhost:8012/test',
    },
  ];

  tsdav.deleteCalendarObject = () => ({});

  const MOCK_URL = 'http://localhost';

  tsdav.createAccount = () =>
    ({
      accountType: 'caldav',
      serverUrl: MOCK_URL,
      credentials: {
        username: 'test',
        password: 'test',
      },
      rootUrl: MOCK_URL,
      principalUrl: MOCK_URL,
      homeUrl: MOCK_URL,
      calendars: [
        {
          components: ['VEVENT', 'VTODO'],
          ctag: 'ABCDE',
          displayName: 'default',
          url: 'cal',
        },
      ],
    } as DAVAccount);
};

export const mockTsDavUnauthorized = () => {
  ImportMock.restore();

  tsdav.createAccount = () => {
    throw new Error('Error');
  };

  tsdav.fetchCalendarObjects = () => {
    throw new Error('Error');
  };

  tsdav.createCalendarObject = () => ({
    status: 305,
  });
  tsdav.updateCalendarObject = () => ({
    status: 305,
  });
  tsdav.deleteCalendarObject = () => ({
    status: 305,
  });
  tsdav.makeCalendar = () => ({
    status: 305,
  });
  tsdav.fetchCalendars = () => ({
    status: 305,
  });
  tsdav.deleteVCard = () => ({
    status: 305,
  });
  tsdav.createVCard = () => ({
    status: 305,
  });
  tsdav.fetchVCards = () => ({
    status: 305,
  });
};
