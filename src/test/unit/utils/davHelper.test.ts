import { CALENDAR_METHOD } from '../../../utils/ICalHelper';
import { injectMethod } from '../../../utils/davHelper';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');

const eventString = `BEGIN:VCALENDAR
PRODID:Test
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
DESCRIPTION:adadasd174C5B7301A82E0080000000089FCDD3B6C29D701000000000000000
 samasiioasfioasjfio ja asfmioasiof asjio fjasifj ioasjf ioasji jfsaijfio j
 mcXXXXXXx
UID:1234141
SUMMARY:teaaaaa
DTSTART:20210401T110000Z
DTEND:20210401T113000Z
CLASS:PUBLIC
PRIORITY:5
DTSTAMP:20210402T205602Z
TRANSP:OPAQUE
STATUS:CONFIRMED
SEQUENCE:0
LOCATION:asdsfdf
END:VEVENT
END:VCALENDAR`;

const eventStringWithMethod = `BEGIN:VCALENDAR
PRODID:Test
VERSION:2.0
METHOD:REQUEST
CALSCALE:GREGORIAN
BEGIN:VEVENT
DESCRIPTION:adadasd174C5B7301A82E0080000000089FCDD3B6C29D701000000000000000
 samasiioasfioasjfio ja asfmioasiof asjio fjasifj ioasjf ioasji jfsaijfio j
 mcXXXXXXx
UID:1234141
SUMMARY:teaaaaa
DTSTART:20210401T110000Z
DTEND:20210401T113000Z
CLASS:PUBLIC
PRIORITY:5
DTSTAMP:20210402T205602Z
TRANSP:OPAQUE
STATUS:CONFIRMED
SEQUENCE:0
LOCATION:asdsfdf
END:VEVENT
END:VCALENDAR`;

describe(`[UNIT] utils/davHelper`, async function () {
  it('Should inject method to ical string', async function () {
    const result = injectMethod(eventString, CALENDAR_METHOD.REQUEST);

    assert.equal(result, eventStringWithMethod);
  });
});
