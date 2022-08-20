import { seedUsers } from '../../../seeds/1-user-seed';

import { ImportMock } from 'ts-mock-imports';
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { initCalDavMock } from '../../../../__mocks__/calDavMock';
import { invalidUUID } from '../../../../testHelpers/common';
import { mockTsDav, mockTsDavUnauthorized } from '../../../../__mocks__/tsdav';
import { seedContacts } from '../../../seeds/12-cardDavContacts';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = (id: string) => `/api/v1/carddav/contacts/${id}`;

describe(`Delete carddav contact [DELETE] ${PATH}`, async function () {
  let contactID;

  before(async () => {
    initCalDavMock();
  });

  let userID;

  beforeEach(async () => {
    [userID] = await seedUsers();
    const { contact } = await seedContacts(userID);
    contactID = contact.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .delete(PATH(contactID))
      .send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404 not found', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .delete(PATH(invalidUUID))
      .send();

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 409 cannot connect to calDav server', async function () {
    ImportMock.restore();
    mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession(userID))
      .delete(PATH(contactID))
      .send();

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockTsDav();
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .delete(PATH(contactID))
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
