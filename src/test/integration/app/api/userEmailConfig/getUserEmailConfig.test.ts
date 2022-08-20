import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedUserEmailConfig } from '../../../seeds/9-userEmailConfig';
import { seedUsers } from '../../../seeds/1-user-seed';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/v1/users/email-config';

describe(`Get user email config [GET] ${PATH}`, async function () {
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    await seedUserEmailConfig(userID);
  });

  it('Should get status 401', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).get(PATH).send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 system config', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server).get(PATH).send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 user config', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server).get(PATH).send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 403 forbidden', async function () {
    const server: any = createTestServerWithSession(demoUserID);

    const response: any = await request(server).get(PATH).send();

    const { status } = response;

    assert.equal(status, 403);
  });
});
