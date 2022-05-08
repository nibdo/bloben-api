import {initSeeds} from "../../../seeds/init";

const request = require('supertest');
const assert = require('assert');

import { createTestServerWithSession } from '../../../../testHelpers/initTestServer';

const PATH = '/api/v1/users/logout';

describe(`Logout [GET] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds();
  });

  it('Should get status 200 demo user', async function () {
    const response: any = await request(createTestServerWithSession(true)).get(
        PATH
    );

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession()).get(
      PATH
    );

    const { status } = response;

    assert.equal(status, 200);
  });
});
