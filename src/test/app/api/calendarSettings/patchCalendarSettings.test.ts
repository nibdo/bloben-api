import { initSeeds, initUserSeed } from '../../../seeds/init';

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../utils/initTestServer';
import {invalidUUID} from "../adminUsers/adminDeleteUser.test";

const PATH = '/api/v1/calendar-settings';

describe(`Patch calendar settings [PATCH] ${PATH}`, async function () {
  it('Should get status 401', async function () {
    await initUserSeed();

    const server: any = createTestServer();

    const response: any = await request(server).patch(PATH).send({
      timeFormat: 24,
    });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200', async function () {
    await initUserSeed();

    const server: any = createTestServerWithSession();

    const response: any = await request(server).patch(PATH).send({
      timeFormat: 24,
      hourHeight: 60,
    });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200', async function () {
    await initUserSeed();

    const server: any = createTestServerWithSession();

    const response: any = await request(server).patch(PATH).send({
      defaultCalendarID: invalidUUID,
    });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 403 forbidden', async function () {
    await initUserSeed();

    const server: any = createTestServerWithSession(true);

    const response: any = await request(server).patch(PATH).send({
      timeFormat: 24,
    });

    const { status } = response;

    assert.equal(status, 403);
  });
});
