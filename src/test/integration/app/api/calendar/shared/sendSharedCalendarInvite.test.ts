import { invalidUUID } from '../../../../../testHelpers/common';

const request = require('supertest');
const assert = require('assert');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../../testHelpers/initTestServer';
import { initSeeds } from '../../../../seeds/init';
import { PostSendSharedCalendarInviteRequest } from '../../../../../../bloben-interface/calendar/shared/calendarShared';
import {mockNodemailer} from "../../../../../__mocks__/nodemailer";

const PATH = (id: string) => `/api/v1/calendars/shared/${id}/invite`;

const body: PostSendSharedCalendarInviteRequest = {
  emailBody: 'Test email',
  recipients: ['hello@bloben.com'],
};

describe(`Send shared calendar [POST] ${PATH}`, async function () {
  let sharedLinkID;
  let sharedLinkExpiredID
  let sharedLinkDisabledID
  beforeEach(async () => {
    const { sharedLink, sharedLinkDisabled, sharedLinkExpired } = await initSeeds();
    sharedLinkID = sharedLink.id;
    sharedLinkExpiredID = sharedLinkExpired.id
    sharedLinkDisabledID = sharedLinkDisabled.id

    mockNodemailer()
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .post(PATH(sharedLinkID))
      .send(body);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 demo user', async function () {
    const response: any = await request(createTestServerWithSession(true))
      .post(PATH(sharedLinkID))
      .send(body);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession())
      .post(PATH(invalidUUID))
      .send(body);

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 409 expired', async function () {
    const response: any = await request(createTestServerWithSession())
        .post(PATH(sharedLinkExpiredID))
        .send(body);

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 409 disabled', async function () {
    const response: any = await request(createTestServerWithSession())
        .post(PATH(sharedLinkDisabledID))
        .send(body);

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession())
      .post(PATH(sharedLinkID))
      .send(body);

    const { status } = response;

    assert.equal(status, 200);
  });
});
