import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { mockImapService } from '../../../../__mocks__/ImapService';
import { mockNodemailer } from '../../../../__mocks__/nodemailer';
import { seedUsers } from '../../../seeds/user-seed';
import { userEmailConfigData } from '../../../seeds/userEmailConfig';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/app/v1/users/email-config';

describe(`Create user email config [POST] ${PATH}`, async function () {
  before(async () => {
    mockNodemailer();
    mockImapService();
  });

  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
  });

  it('Should get status 401', async function () {
    const server: any = createTestServer();

    const response: any = await request(server)
      .post(PATH)
      .send(userEmailConfigData);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 ', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server)
      .post(PATH)
      .send(userEmailConfigData);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 403 forbidden', async function () {
    const server: any = createTestServerWithSession(demoUserID);

    const response: any = await request(server)
      .post(PATH)
      .send(userEmailConfigData);

    const { status } = response;

    assert.equal(status, 403);
  });
});
