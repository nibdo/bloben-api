import { seedUsers } from '../../../seeds/user-seed';

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedCardDavAddressBooks } from '../../../seeds/cardDavAddressBooks';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = (addressBookID: string) =>
  `/api/app/v1/carddav/contacts?addressBookID=${addressBookID}`;

describe(`Get carddav contacts [GET] ${PATH}`, async function () {
  let addressBookID;

  let userID;

  beforeEach(async () => {
    [userID] = await seedUsers();
    const { cardDavAddressBook } = await seedCardDavAddressBooks(userID);
    addressBookID = cardDavAddressBook.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .get(PATH(addressBookID))
      .send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .get(PATH(addressBookID))
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
