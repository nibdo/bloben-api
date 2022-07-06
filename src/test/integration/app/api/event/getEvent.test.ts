import { initSeeds } from '../../../seeds/init';

const request = require('supertest');
const assert = require('assert');
import { v4 } from 'uuid';
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { EVENT_TYPE } from '../../../../../bloben-interface/enums';

const PATH = (id: string) =>
  `/api/v1/events/${id}?type=${EVENT_TYPE.CALDAV}&isDark=false`;

describe(`Get event by ID [GET] ${PATH}`, async function () {
  let id = null;
  beforeEach(async () => {
    const { event } = await initSeeds();
    id = event.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).get(`${PATH(id)}`);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404 not found', async function () {
    const response: any = await request(createTestServerWithSession(true)).get(
      `${PATH(v4())}`
    );

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession()).get(
      `${PATH(id)}`
    );

    const { status } = response;

    assert.equal(status, 200);
  });
});
