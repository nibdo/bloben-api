import {initSeeds} from "../../../seeds/init";

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../utils/initTestServer';

const PATH = `/api/v1/timezones`;

describe(`Get timezones [GET] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds();
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).get(PATH);

    const { status } = response;

    assert.equal(status, 401);
  });
  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession()).get(
      PATH
    );

    const { status } = response;

    assert.equal(status, 200);
  });
});
