import { EVENT_TYPE } from '../../../../../data/types/enums';
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedCalDavEvents } from '../../../seeds/4-calDavEvents';
import { seedUsers } from '../../../seeds/1-user-seed';
import { v4 } from 'uuid';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = (id: string) =>
  `/api/app/v1/events/${id}?type=${EVENT_TYPE.CALDAV}&isDark=false`;

describe(`Get event by ID [GET] ${PATH}`, async function () {
  let id = null;
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { event } = await seedCalDavEvents(userID);
    id = event.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).get(`${PATH(id)}`);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404 not found', async function () {
    const response: any = await request(
      createTestServerWithSession(demoUserID)
    ).get(`${PATH(v4())}`);

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(
      createTestServerWithSession(userID)
    ).get(`${PATH(id)}`);

    const { status } = response;

    assert.equal(status, 200);
  });
});
