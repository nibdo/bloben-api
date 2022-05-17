import { initSeeds } from '../../../seeds/init';

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';

const PATH = `/api/v1/events/range`;

describe(`Get events [GET] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds();
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).get(
      `${PATH}?rangeFrom=2021-08-01T20:00:00.364Z&rangeTo=2021-08-29T20:00:00.364Z&isDark=true`
    );

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 demo user', async function () {
    const response: any = await request(createTestServerWithSession(true)).get(
      `${PATH}?rangeFrom=2021-08-01T20:00:00.364Z&rangeTo=2021-08-29T20:00:00.364Z&isDark=true`
    );

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession()).get(
      `${PATH}?rangeFrom=2021-08-01T20:00:00.364Z&rangeTo=2021-08-29T20:00:00.364Z&isDark=true`
    );

    const { status } = response;

    console.log('aa', response.body);
    assert.equal(status, 200);
  });
});
