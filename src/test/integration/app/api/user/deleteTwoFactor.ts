import { initSeeds } from '../../../seeds/init';

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';

const PATH = '/api/v1/users/2fa';

describe(`Delete two factor [DELETE] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds();
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).delete(PATH);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(
      createTestServerWithSession(true)
    ).delete(PATH);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession()).delete(
      PATH
    );

    const { status } = response;

    assert.equal(status, 200);
  });
});