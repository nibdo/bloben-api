import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedUserEmailConfig } from '../../../seeds/userEmailConfig';
import { seedUsers } from '../../../seeds/user-seed';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/app/v1/users/email-config';

describe(`Delete user email config [DELETE] ${PATH}`, async function () {
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
  });

  it('Should get status 401', async function () {
    const server: any = createTestServer();
    const response: any = await request(server).delete(PATH).send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200', async function () {
    await seedUserEmailConfig(userID);

    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server).delete(PATH).send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 404', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server).delete(PATH).send();

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 403 forbidden', async function () {
    await seedUserEmailConfig(userID);

    const server: any = createTestServerWithSession(demoUserID);

    const response: any = await request(server).delete(PATH).send();

    const { status } = response;

    assert.equal(status, 403);
  });
});
