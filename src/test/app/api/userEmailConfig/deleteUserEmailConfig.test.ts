import {initSeeds, initUserSeed} from "../../../seeds/init";

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../utils/initTestServer';
import {userEmailConfigData} from "../../../seeds/9-userEmailConfig";

const PATH = '/api/v1/users/email-config';

describe(`Delete user email config [DELETE] ${PATH}`, async function () {
  it('Should get status 401', async function () {
    await initUserSeed()

    const server: any = createTestServer();

    const response: any = await request(server).delete(PATH).send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200', async function () {
    await initSeeds()

    const server: any = createTestServerWithSession();

    const response: any = await request(server).delete(PATH).send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 404', async function () {
    await initUserSeed()

    const server: any = createTestServerWithSession();

    const response: any = await request(server).delete(PATH).send();

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 403 forbidden', async function () {
    await initUserSeed()

    const server: any = createTestServerWithSession(true);

    const response: any = await request(server).delete(PATH).send();

    const { status } = response;

    assert.equal(status, 403);
  });
});
