import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedUsers } from '../../../seeds/1-user-seed';
import { seedWebcal } from '../../../seeds/6-webcal';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = `/api/app/v1/webcal/calendars`;

const data: any = {
  name: 'Test cal',
  color: 'indigo',
  url: 'http://localhost:3001',
  syncFrequency: 1,
  alarms: [
    {
      amount: 10,
      timeUnit: 'minutes',
    },
  ],
};

describe(`Create webcal calendar [POST] ${PATH}`, async function () {
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    await seedWebcal(userID);
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .post(PATH)
      .send(data);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 demo', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .post(PATH)
      .send(data);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 409 already exists', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({ ...data, url: 'http://localhost:3000' });

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send(data);

    const { status } = response;

    assert.equal(status, 200);
  });
});
