import {initSeeds, initUserSeed} from "../../../seeds/init";

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../utils/initTestServer';
import {userEmailConfigData} from "../../../seeds/9-userEmailConfig";

const PATH = '/api/v1/users/email-config';

describe(`Get user email config [GET] ${PATH}`, async function () {
  it('Should get status 401', async function () {
    await initUserSeed()

    const server: any = createTestServer();

    const response: any = await request(server).get(PATH).send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 system config', async function () {
    await initUserSeed()

    const server: any = createTestServerWithSession();

    const response: any = await request(server).get(PATH).send();

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.smtpPassword, '*****')
    assert.equal(body.smtpUsername, '*****')
  });

  it('Should get status 200 user config', async function () {
    await initSeeds()

    const server: any = createTestServerWithSession();

    const response: any = await request(server).get(PATH).send();

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.smtpPassword, '*****')
  });

  it('Should get status 404 config not found', async function () {
    await initUserSeed()

    const server: any = createTestServerWithSession();

    const response: any = await request(server).get(PATH).send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 403 forbidden', async function () {
    await initUserSeed()

    const server: any = createTestServerWithSession(true);

    const response: any = await request(server).get(PATH).send();

    const { status } = response;

    assert.equal(status, 403);
  });
});
