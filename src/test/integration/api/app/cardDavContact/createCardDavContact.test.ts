import { seedUsers } from '../../../seeds/user-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import { ImportMock } from 'ts-mock-imports';
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { initCalDavMock } from '../../../../__mocks__/calDavMock';
import { invalidUUID } from '../../../../testHelpers/common';
import { mockTsDav, mockTsDavUnauthorized } from '../../../../__mocks__/tsdav';
import { seedCardDavAddressBooks } from '../../../seeds/cardDavAddressBooks';

const PATH = '/api/app/v1/carddav/contacts';

describe(`Create carddav contact [POST] ${PATH}`, async function () {
  let addressBookID;
  before(async () => {
    initCalDavMock();
  });

  let userID;
  let demoUserID;

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { cardDavAddressBook } = await seedCardDavAddressBooks(userID);
    addressBookID = cardDavAddressBook.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).post(PATH).send({
      addressBookID: addressBookID,
      fullName: 'test',
      email: 'aaa@bloben.com',
    });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404 not found', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({
        addressBookID: invalidUUID,
        fullName: 'test',
        email: 'aaa@bloben.com',
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 409 cannot connect to calDav server', async function () {
    ImportMock.restore();
    mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({
        addressBookID: addressBookID,
        fullName: 'test',
        email: 'aaa@bloben.com',
      });

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockTsDav();
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .post(PATH)
      .send({
        addressBookID: addressBookID,
        fullName: 'test',
        email: 'aaa@bloben.com',
      });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({
        addressBookID: addressBookID,
        fullName: 'test',
        email: 'aaa@bloben.com',
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
