import { initSeeds } from '../../../seeds/init';

import request from 'supertest';
const assert = require('assert');

import {
  createAdminTestServerWithSession,
  createTestServer,
} from '../../../utils/initTestServer';
import { USER_ROLE } from '../../../../api/user/UserEnums';
import {
  createAdminToken,
  createWrongAdminToken
} from '../../../utils/getTestUser';

const PATH = (id: string) => `/api/v1/admin/users/${id}`;

export const invalidUUID = '460f1b3c-d781-45b3-9f2f-0008cf57c126';

describe(`Update user admin [PATCH] ${PATH}`, async function () {
  let userID;
  let adminID;
  let token;
  let wrongToken;

  beforeEach(async () => {
    const { user, admin } = await initSeeds();
    userID = user.id;
    adminID = admin.id;
    token = await createAdminToken();
    wrongToken = await createWrongAdminToken()
  });

  it('Should get status 200', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .patch(PATH(userID))
      .set('token', token)
      .send({
        isEnabled: true,
        role: USER_ROLE.DEMO,
      });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 404 not found', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .patch(PATH(invalidUUID))
      .set('token', token)
      .send({
        isEnabled: true,
        role: USER_ROLE.DEMO,
      });

    const { status } = response;
    assert.equal(status, 404);
  });

  it('Should get status 409 cannot update self', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .patch(PATH(adminID))
      .set('token', token)
      .send({
        isEnabled: true,
        role: USER_ROLE.DEMO,
      });

    const { status } = response;
    assert.equal(status, 409);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
        .patch(PATH(userID))
        .set('token', wrongToken)
        .send({
          isEnabled: true,
          role: USER_ROLE.DEMO,
        });

    const { status } = response;

    assert.equal(status, 401);
  });
});
