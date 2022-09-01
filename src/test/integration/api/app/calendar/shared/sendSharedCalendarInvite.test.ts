import { invalidUUID } from '../../../../../testHelpers/common';

import { PostSendSharedCalendarInviteRequest } from 'bloben-interface';
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../../testHelpers/initTestServer';
import { mockNodemailer } from '../../../../../__mocks__/nodemailer';
import { seedSharedCalendar } from '../../../../seeds/10-sharedCalendar';
import { seedUsers } from '../../../../seeds/1-user-seed';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = (id: string) => `/api/app/v1/calendars/shared/${id}/invite`;

const body: PostSendSharedCalendarInviteRequest = {
  emailBody: 'Test email',
  recipients: ['hello@bloben.com'],
};

describe(`Send shared calendar [POST] ${PATH}`, async function () {
  let sharedLinkID;
  let sharedLinkExpiredID;
  let sharedLinkDisabledID;
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { sharedLink, sharedLinkDisabled, sharedLinkExpired } =
      await seedSharedCalendar(userID);

    sharedLinkID = sharedLink.id;
    sharedLinkExpiredID = sharedLinkExpired.id;
    sharedLinkDisabledID = sharedLinkDisabled.id;

    mockNodemailer();
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .post(PATH(sharedLinkID))
      .send(body);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 demo user', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .post(PATH(sharedLinkID))
      .send(body);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH(invalidUUID))
      .send(body);

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 409 expired', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH(sharedLinkExpiredID))
      .send(body);

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 409 disabled', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH(sharedLinkDisabledID))
      .send(body);

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH(sharedLinkID))
      .send(body);

    const { status } = response;

    assert.equal(status, 200);
  });
});
