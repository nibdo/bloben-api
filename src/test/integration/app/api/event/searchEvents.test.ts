import { initSeeds } from '../../../seeds/init';

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';

const PATH = (summary: string) => `/api/v1/events/search?summary=${summary}`;

describe(`Search events [GET] ${PATH}`, async function () {
  let summary = '';
  beforeEach(async () => {
    const { event } = await initSeeds();
    summary = event.summary;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).get(
      `${PATH('abc')}`
    );

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 demo user', async function () {
    const response: any = await request(createTestServerWithSession(true)).get(
      `${PATH('abc')}`
    );

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 no result', async function () {
    const response: any = await request(createTestServerWithSession()).get(
      `${PATH('abc123')}`
    );

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.length, 0);
  });

  it('Should get status 200 found event', async function () {
    const response: any = await request(createTestServerWithSession()).get(
      `${PATH(summary)}`
    );

    const { status, body } = response;

    assert.equal(status, 200);
    assert.notEqual(body.length, 0);
  });
});
