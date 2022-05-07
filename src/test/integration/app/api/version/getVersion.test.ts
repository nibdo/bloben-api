import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import {initSeeds} from "../../../seeds/init";

const request = require('supertest');
const assert = require('assert');

const PATH = '/api/v1/version';

describe(`Get version [GET] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds();
  });

  it('Should get status 200 not logged', async function () {
    const response: any = await request(createTestServer()).get(PATH);

    const { status } = response;

    assert.equal(status, 200);
  });
  it('Should get status 200 logged', async function () {
    const response: any = await request(createTestServerWithSession()).get(
      PATH
    );

    const { status } = response;

    assert.equal(status, 200);
  });
});
