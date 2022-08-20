import { CreateCalDavAccountRequest } from '../../../../bloben-interface/calDavAccount/calDavAccount';
import { DAV_ACCOUNT_TYPE } from '../../../../bloben-interface/enums';
import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import { seedUserOnlyCalDavSeedE2E } from '../../seeds/1-user-caldav-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/v1/caldav-accounts';

describe(`[E2E] Create calDav account [POST] ${PATH}`, async function () {
  let userID;
  beforeEach(async () => {
    const { userData } = await seedUserOnlyCalDavSeedE2E();
    userID = userData.user.id;
  });

  it('Should get status 409', async function () {
    const response: any = await request(createE2ETestServerWithSession(userID))
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
    const response1 = await request(createE2ETestServerWithSession(userID))
      .post(PATH)
      .send({
        username: 'tester',
        password: 'tester',
        url: 'http://localhost:6080/dav.php',
        accountType: DAV_ACCOUNT_TYPE.CALDAV,
      } as CreateCalDavAccountRequest);

    assert.equal(response1.status, 200);

    const response2: any = await request(createE2ETestServerWithSession(userID))
      .post(PATH)
      .send({
        username: 'tester',
        password: 'tester',
        url: 'http://localhost:6080/dav.php',
        accountType: DAV_ACCOUNT_TYPE.CALDAV,
      } as CreateCalDavAccountRequest);

    const { status } = response2;

    assert.equal(status, 409);
  });

  it('Should get status 200 with caldav server', async function () {
    const response: any = await request(createE2ETestServerWithSession(userID))
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
