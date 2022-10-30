import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedUsers } from '../../../seeds/user-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/app/v1/auth/login';

describe(`Get session [GET] ${PATH}`, async function () {
  let userID;
  beforeEach(async () => {
    [userID] = await seedUsers();
  });

  it('Should get status 200 not logged', async function () {
    const response: any = await request(createTestServer()).get(PATH);

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.isLogged, false);
  });

  it('Should get status 200 logged', async function () {
    const response: any = await request(
      createTestServerWithSession(userID)
    ).get(PATH);

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.isLogged, true);
  });
});
