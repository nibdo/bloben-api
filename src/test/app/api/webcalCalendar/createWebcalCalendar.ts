const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../utils/initTestServer';

const PATH = `/v1/webcal/calendars`;

const data: any = {
  name: 'Test cal',
  color: 'indigo',
  url: 'http://localhost:3001',
  syncFrequency: 180,
};

describe(`Create webcal calendar [POST] ${PATH}`, async function () {
  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .post(PATH)
      .send(data);

    const { status } = response;

    assert.equal(status, 401);
  });
  it('Should get status 409 already exists', async function () {
    const response: any = await request(createTestServerWithSession())
      .post(PATH)
      .send({ ...data, url: 'http://localhost:3000' });

    const { status } = response;

    assert.equal(status, 409);
  });
  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession())
      .post(PATH)
      .send(data);

    const { status } = response;

    assert.equal(status, 200);
  });
});
