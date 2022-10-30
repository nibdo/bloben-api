import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import { invalidUUID } from '../../../testHelpers/common';
import { seedUsersE2E } from '../../seeds/user-caldav-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = (id: string) => `/api/app/v1/caldav-accounts/${id}`;

describe(`[E2E] Update calDav account [PUT] ${PATH}`, async function () {
  let calDavAccountID;
  let userID;
  beforeEach(async () => {
    const { userData } = await seedUsersE2E();
    userID = userData.user.id;
    calDavAccountID = userData.calDavAccount.id;
  });

  it('Should get status 409', async function () {
    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH(calDavAccountID))
      .send({
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 404 not found', async function () {
    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH(invalidUUID))
      .send({
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createE2ETestServerWithSession(userID))
      .put(PATH(calDavAccountID))
      .send({
        password: 'tester',
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
