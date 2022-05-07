import {invalidUUID} from "../../../../testHelpers/common";

const request = require('supertest');
const assert = require('assert');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { initSeeds } from '../../../seeds/init';

const PATH = (calendarID: string) => `/api/v1/caldav-task/settings/${calendarID}`;

describe(`Update calDav task settings [PUT] ${PATH}`, async function () {
  let calDavCalendarID;
  beforeEach(async () => {
    const { calDavCalendar } = await initSeeds();
    calDavCalendarID = calDavCalendar.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).put(PATH(calDavCalendarID)).send({
      orderBy: 'custom',
      order: []
    });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404 not found', async function () {
    const response: any = await request(createTestServerWithSession())
      .put(PATH(invalidUUID))
      .send({
        order: [],
        orderBy: 'custom'
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(true))
      .put(PATH(calDavCalendarID))
      .send({
        order: [],
        orderBy: 'custom'
      });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession())
      .put(PATH(calDavCalendarID))
      .send({
        order: [],
        orderBy: 'custom'
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
