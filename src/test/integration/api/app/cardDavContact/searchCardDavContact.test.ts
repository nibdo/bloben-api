import { seedUsers } from '../../../seeds/user-seed';

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedContacts } from '../../../seeds/cardDavContacts';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = (text: string) =>
  `/api/app/v1/carddav/contacts/search?text=${text}`;

describe(`Search carddav contact [GET] ${PATH}`, async function () {
  let userID;

  beforeEach(async () => {
    [userID] = await seedUsers();
    await seedContacts(userID);
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .get(PATH('contact'))
      .send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .get(PATH('contact'))
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .get(PATH(''))
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
