import { initSeeds, initUserSeed } from '../../../seeds/init';

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { userEmailConfigData } from '../../../seeds/9-userEmailConfig';
import { mockNodemailer } from '../../../../__mocks__/nodemailer';
import {mockImapService} from "../../../../__mocks__/ImapService";

const PATH = '/api/v1/users/email-config';

describe(`Update user email config [PATCH] ${PATH}`, async function () {
  before(async () => {
    await mockNodemailer();
  });

  it('Should get status 401', async function () {
    await initUserSeed();

    const server: any = createTestServer();

    const response: any = await request(server)
      .patch(PATH)
      .send(userEmailConfigData);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 existing config', async function () {
    await initSeeds();

    const server: any = createTestServerWithSession();

    const response: any = await request(server)
      .patch(PATH)
      .send(userEmailConfigData);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 new config', async function () {
    await initUserSeed();

    const server: any = createTestServerWithSession();

    const response: any = await request(server)
      .patch(PATH)
      .send(userEmailConfigData);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 new config with imap', async function () {
    await mockImapService()

    await initUserSeed();

    const server: any = createTestServerWithSession();

    const response: any = await request(server)
      .patch(PATH)
      .send({
        ...userEmailConfigData,
        ...{
          imap: {
            imapHost: 'a',
            imapPort: 200,
            imapPassword: 'c',
            imapUsername: 'd',
          },
        },
      });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 403 forbidden', async function () {
    await initUserSeed();

    const server: any = createTestServerWithSession(true);

    const response: any = await request(server)
      .patch(PATH)
      .send(userEmailConfigData);

    const { status } = response;

    assert.equal(status, 403);
  });
});
