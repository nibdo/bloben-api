import { initSeeds } from '../../../seeds/init';

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../utils/initTestServer';

const PATH = '/api/v1/users/2fa';

describe(`Get two factor [GET] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds();
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).get(PATH);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(true)).get(
      PATH
    );

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession()).get(
      PATH
    );

    const { status } = response;

    assert.equal(status, 200);
  });
});
