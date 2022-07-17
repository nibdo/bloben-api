import { invalidUUID } from '../../../../../testHelpers/common';

const request = require('supertest');
const assert = require('assert');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../../testHelpers/initTestServer';
import { initSeeds } from '../../../../seeds/init';

const PATH = (id: string) => `/api/v1/calendars/shared/${id}`;

describe(`Delete shared calendar [DELETE] ${PATH}`, async function () {
  let sharedLinkID;
  beforeEach(async () => {
    const { sharedLink } = await initSeeds();
    sharedLinkID = sharedLink.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .delete(PATH(sharedLinkID))
      .send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 demo user', async function () {
    const response: any = await request(createTestServerWithSession(true))
        .delete(PATH(sharedLinkID))
        .send();

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession())
        .delete(PATH(invalidUUID))
        .send();

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession())
      .delete(PATH(sharedLinkID))
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
