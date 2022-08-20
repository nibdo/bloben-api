import { seedUsers } from '../../../seeds/1-user-seed';

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedCardDavAddressBooks } from '../../../seeds/11-cardDavAddressBooks';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/v1/carddav/address-books';

describe(`Get cardDav address books [GET] ${PATH}`, async function () {
  let userID;

  beforeEach(async () => {
    [userID] = await seedUsers();
    await seedCardDavAddressBooks(userID);
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).get(PATH).send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .get(PATH)
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
