import AxiosService from '../../service/AxiosService';

export const WEBCAL_MOCK_URL_SUCCESS = 'http://localhost:3000/webcal/success';
export const WEBCAL_MOCK_URL_FAIL = 'http://localhost:3000/webcal/fail';

export const mockAxios = () => {
  AxiosService.get = (url: string) => {
    if (url === WEBCAL_MOCK_URL_FAIL) {
      throw Error('Not found');
    }

    if (url === WEBCAL_MOCK_URL_SUCCESS) {
      return {
        data: `BEGIN:VCALENDAR
PRODID:Bloben
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:test@bloben.com
X-WR-TIMEZONE:Europe/Berlin
BEGIN:VTIMEZONE
TZID:Europe/Berlin
X-LIC-LOCATION:Europe/Berlin
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
DTSTART:vdzxvzxv212312312
DTEND:2020228T08400Z
DTSTAMP:20220228T020824Z
UID:ba436346346@bloben.com
CREATED:20220228T013738Z
DESCRIPTION:
LAST-MODIFIED:20220228T013738Z
LOCATION:
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Wrong
TRANSP:OPAQUE
END:VEVENT
BEGIN:VEVENT
DTSTART;TZID=US-Eastern:20210201T080000Z
DTEND;TZID=US-Eastern:20210201T10000000Z
DTSTAMP:20220228T020824Z
UID:ba132123@bloben.com
CREATED:20220228T013738Z
DESCRIPTION:
LAST-MODIFIED:20220228T013738Z
LOCATION:
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Wrong
TRANSP:OPAQUE
END:VEVENT
BEGIN:VEVENT
DTSTART:20220228T080000Z
DTEND:20220228T084500Z
DTSTAMP:20220228T020824Z
UID:6khh9v56asfasfvbu22h7@bloben.com
CREATED:20220228T013738Z
DESCRIPTION:
LAST-MODIFIED:20220228T013738Z
LOCATION:
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Call
TRANSP:OPAQUE
END:VEVENT
BEGIN:VEVENT
DTSTART:vdzxvzxv212312312
DTEND:20220228T084500Z
DTSTAMP:20220228T020824Z
UID:6khh9v56asfasfvbu22h7@bloben.com
CREATED:20220228T013738Z
DESCRIPTION:
LAST-MODIFIED:20220228T013738Z
LOCATION:
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Wrong
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`,
      };
    }
  };
};
