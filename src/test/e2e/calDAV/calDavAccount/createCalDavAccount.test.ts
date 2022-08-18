import { initUserOnlySeeds } from '../../seeds/init';
import { CreateCalDavAccountRequest } from '../../../../bloben-interface/calDavAccount/calDavAccount';
import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import { DAV_ACCOUNT_TYPE } from '../../../../bloben-interface/enums';

const request = require('supertest');
const assert = require('assert');

const PATH = '/api/v1/caldav-accounts';

describe(`[E2E] Create calDav account [POST] ${PATH}`, async function () {
  beforeEach(async () => {
    await initUserOnlySeeds();
  });

  it('Should get status 409', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .post(PATH)
      .send({
        username: 'tester',
        password: 'tester1234',
        url: 'http://localhost:6080/dav.php',
        accountType: DAV_ACCOUNT_TYPE.CALDAV,
      } as CreateCalDavAccountRequest);

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 409 already exists', async function () {
    await request(createE2ETestServerWithSession())
      .post(PATH)
      .send({
        username: 'tester',
        password: 'tester',
        url: 'http://localhost:6080/dav.php',
        accountType: DAV_ACCOUNT_TYPE.CALDAV,
      } as CreateCalDavAccountRequest);

    const response: any = await request(createE2ETestServerWithSession())
      .post(PATH)
      .send({
        username: 'tester',
        password: 'tester',
        url: 'http://localhost:6080/dav.php',
        accountType: DAV_ACCOUNT_TYPE.CALDAV,
      } as CreateCalDavAccountRequest);

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 200 with caldav server', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .post(PATH)
      .send({
        username: 'tester',
        password: 'tester',
        url: 'http://localhost:6080/dav.php',
        accountType: DAV_ACCOUNT_TYPE.CALDAV,
      } as CreateCalDavAccountRequest);

    const { status } = response;

    assert.equal(status, 200);
  });
});
