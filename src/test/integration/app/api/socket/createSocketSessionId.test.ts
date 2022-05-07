import {
  CreateSocketSessionRequest
} from "../../../../../bloben-interface/socket/socket";

const request = require('supertest');
const assert = require('assert');
import { v4 } from 'uuid';

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import {initSeeds} from "../../../seeds/init";

const PATH = '/api/v1/socket';

const data: CreateSocketSessionRequest = {
  clientSessionId: v4(),
};

describe(`Socket session [POST] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds();
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .post(PATH)
      .send(data);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 demo user', async function () {
    const response: any = await request(createTestServerWithSession(true))
        .post(PATH)
        .send(data);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession())
      .post(PATH)
      .send(data);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .post(PATH)
      .send(data);

    const { status } = response;

    assert.equal(status, 401);
  });
});
