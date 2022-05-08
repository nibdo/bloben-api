import { v4 } from 'uuid';

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { createWebcalCalendars } from '../../../seeds/6-webcal';
import {invalidUUID} from "../../../../testHelpers/common";

const PATH = (id: string) => `/v1/webcal/calendars/${id}`;

describe(`Patch calendar [PATCH] ${PATH}`, async function () {
  let calendarID: string;
  beforeEach(async function () {
    const calendar: any = await createWebcalCalendars();
    calendarID = calendar.id;
  });
  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .patch(PATH(calendarID))
      .send({
        isHidden: true,
      });

    const { status } = response;

    assert.equal(status, 401);
  });
  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession())
      .patch(PATH(invalidUUID))
      .send({
        isHidden: true,
      });

    const { status } = response;

    assert.equal(status, 404);
  });
  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession())
      .patch(PATH(calendarID))
      .send({
        isHidden: true,
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
