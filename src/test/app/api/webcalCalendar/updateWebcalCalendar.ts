import { v4 } from 'uuid';

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession
} from '../../../utils/initTestServer';
import { createWebcalCalendars } from '../../../seeds/6-webcal';

const PATH = (id: string) => `/v1/webcal/calendars/${id}`;

const data: any = {
  name: 'Test cal',
  color: 'indigo',
  url: 'http://localhost:3002',
  syncFrequency: 180
};

describe(`Update calendar [PUT] ${PATH}`, async function() {
  let calendarID: string;
  beforeEach(async function() {
    const calendar: any = await createWebcalCalendars();
    calendarID = calendar.id;
  });
  it('Should get status 401', async function() {
    const response: any = await request(createTestServer())
      .put(PATH(calendarID))
      .send(data);

    const { status } = response;

    assert.equal(status, 401);
  });
  it('Should get status 404', async function() {
    const response: any = await request(createTestServerWithSession())
      .put(PATH(v4()))
      .send(data);

    const { status } = response;

    assert.equal(status, 404);
  });
  it('Should get status 200', async function() {
    const response: any = await request(createTestServerWithSession())
      .put(PATH(calendarID))
      .send(data);

    const { status } = response;

    assert.equal(status, 200);
  });
});
