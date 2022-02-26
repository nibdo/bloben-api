import { testCalendarsData } from '../../../seeds/3-calDavCalendars';
import { v4 } from 'uuid';

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../utils/initTestServer';
import { createWebcalCalendars } from '../../../seeds/6-webcal';

const PATH = `/v1/webcal/calendars`;

describe(`Delete calendar [DELETE] ${PATH}/:calendarID`, async function () {
  let calendarID: string;
  beforeEach(async function () {
    const calendar: any = await createWebcalCalendars();
    calendarID = calendar.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).delete(
      `${PATH}/${testCalendarsData[0].id}`
    );

    const { status } = response;

    assert.equal(status, 401);
  });
  it('Should get status 404 not found', async function () {
    const response: any = await request(createTestServerWithSession()).delete(
      `${PATH}/${v4()}`
    );

    const { status } = response;

    assert.equal(status, 404);
  });
  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession()).delete(
      `${PATH}/${calendarID}`
    );

    const { status } = response;

    assert.equal(status, 200);
  });
  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession()).delete(
      `${PATH}/${calendarID}`
    );

    const { status } = response;

    assert.equal(status, 200);
  });
});
