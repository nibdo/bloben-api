import { initSeeds } from '../../../seeds/init';

import request from 'supertest';
const assert = require('assert');

import { createAdminTestServerWithSession } from '../../../../testHelpers/initTestServer';
import {
  createAdminToken,
  createWrongAdminToken,
} from '../../../../testHelpers/getTestUser';
import { invalidUUID } from '../../../../testHelpers/common';

const PATH = (id: string) => `/api/v1/admin/users/${id}`;

describe(`Delete user admin [DELETE] ${PATH}`, async function () {
  let userID;
  let adminID;
  let token;
  let wrongToken;

  beforeEach(async () => {
    const { user, admin } = await initSeeds();
    userID = user.id;
    adminID = admin.id;
    token = await createAdminToken();
    wrongToken = await createWrongAdminToken();
  });

  it('Should get status 200', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .delete(PATH(userID))
      .set('token', token)
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 404 not found', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .delete(PATH(invalidUUID))
      .set('token', token)
      .send();

    const { status } = response;
    assert.equal(status, 404);
  });

  it('Should get status 409 cannot delete self', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .delete(PATH(adminID))
      .set('token', token)
      .send();

    const { status } = response;
    assert.equal(status, 409);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .delete(PATH(userID))
      .set('token', wrongToken)
      .send();

    const { status } = response;

    assert.equal(status, 401);
  });
});
