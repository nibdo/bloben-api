const request = require('supertest');
const assert = require('assert');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { initSeeds } from '../../../seeds/init';

const PATH = (addressBookID: string) =>
  `/api/v1/carddav/contacts?addressBookID=${addressBookID}`;

describe(`Get carddav contacts [GET] ${PATH}`, async function () {
  let addressBookID;

  beforeEach(async () => {
    const { cardDavAddressBook } = await initSeeds();
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
    const response: any = await request(createTestServerWithSession())
      .get(PATH(addressBookID))
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
