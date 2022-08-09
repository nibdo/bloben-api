const request = require('supertest');
const assert = require('assert');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { initSeeds } from '../../../seeds/init';
import { initCalDavMock } from '../../../../__mocks__/calDavMock';
import { mockTsDav, mockTsDavUnauthorized } from '../../../../__mocks__/tsdav';
import { ImportMock } from 'ts-mock-imports';
import { invalidUUID } from '../../../../testHelpers/common';

const PATH = (text: string) => `/api/v1/carddav/contacts/search?text=${text}`;

describe(`Search carddav contact [GET] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds()
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .get(PATH('contact'))
      .send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession())
      .get(PATH('contact'))
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession())
        .get(PATH(''))
        .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
