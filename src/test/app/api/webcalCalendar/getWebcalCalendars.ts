const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession
} from '../../../utils/initTestServer';

const PATH = `/v1/webcal/calendars`;

describe(`Get calendars [GET] ${PATH}`, async function() {
  it('Should get status 401', async function() {
    const response: any = await request(createTestServer()).get(`${PATH}`);

    const { status } = response;

    assert.equal(status, 401);
  });
  it('Should get status 200', async function() {
    const response: any = await request(createTestServerWithSession()).get(
      `${PATH}`
    );

    const { status } = response;

    assert.equal(status, 200);
  });
});
