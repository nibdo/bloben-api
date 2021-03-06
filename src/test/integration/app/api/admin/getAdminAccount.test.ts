import { initSeeds } from '../../../seeds/init';

import request from 'supertest';
const assert = require('assert');

import {
  createAdminTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import {
  createAdminToken,
  createWrongAdminToken
} from '../../../../testHelpers/getTestUser';

const PATH = '/api/v1/admin/login';

describe(`Get admin account [GET] ${PATH}`, async function () {
  let token;
  let wrongToken;
  beforeEach(async () => {
    await initSeeds();
    token = await createAdminToken();
    wrongToken = await createWrongAdminToken()
  });

  it('Should get status 200', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .get(PATH)
      .set('token', token)
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
        .get(PATH)
        .set('token', wrongToken)
        .send();

    const { status } = response;

    assert.equal(status, 401);
  });
});
