import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { mockImapService } from '../../../../__mocks__/ImapService';
import { mockNodemailer } from '../../../../__mocks__/nodemailer';
import { seedUsers } from '../../../seeds/1-user-seed';
import { userEmailConfigData } from '../../../seeds/9-userEmailConfig';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/v1/users/email-config';

describe(`Update user email config [PATCH] ${PATH}`, async function () {
  before(async () => {
    await mockNodemailer();
  });

  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
  });

  it('Should get status 401', async function () {
    const server: any = createTestServer();

    const response: any = await request(server)
      .patch(PATH)
      .send(userEmailConfigData);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 existing config', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server)
      .patch(PATH)
      .send(userEmailConfigData);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 new config', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server)
      .patch(PATH)
      .send(userEmailConfigData);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 new config with imap', async function () {
    await mockImapService();

    const server: any = createTestServerWithSession(userID);

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
    const server: any = createTestServerWithSession(demoUserID);

    const response: any = await request(server)
      .patch(PATH)
      .send(userEmailConfigData);

    const { status } = response;

    assert.equal(status, 403);
  });
});
