import Joi from 'joi';

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
import { REPEATED_EVENT_CHANGE_TYPE } from '../../../../../bloben-interface/enums';
import CalDavEventEntity from '../../../../../data/entity/CalDavEventEntity';
import { invalidUUID } from '../../../../testHelpers/common';

const PATH = '/api/v1/caldav-events/repeated';

const createBaseBody = (calDavEvent: CalDavEventEntity) => {
  return {
    id: calDavEvent.id,
    type: REPEATED_EVENT_CHANGE_TYPE.SINGLE,
    calendarID: calDavEvent.calendarID,
    url: calDavEvent.href,
    etag: calDavEvent.etag,
    iCalString: null,
    recurrenceID: null,
    exDates: null,
  };
};

describe(`Delete repeated calDav event [DELETE] ${PATH}`, async function () {
  let mockManager;
  let calDavEvent;
  before(async () => {
    mockManager = initCalDavMock();
  });

  beforeEach(async () => {
    const { repeatedEvent } = await initSeeds();
    calDavEvent = repeatedEvent;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .delete(PATH)
      .send(createBaseBody(calDavEvent));

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession())
      .delete(PATH)
      .send({ ...createBaseBody(calDavEvent), id: invalidUUID });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 409 cannot connect to calDav server', async function () {
    ImportMock.restore();
    mockManager = mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession())
      .delete(PATH)
      .send(createBaseBody(calDavEvent));

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockManager = mockTsDav();
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(true))
      .delete(PATH)
      .send(createBaseBody(calDavEvent));

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200 single', async function () {
    const response: any = await request(createTestServerWithSession())
      .delete(PATH)
      .send(createBaseBody(calDavEvent));

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 all', async function () {
    const response: any = await request(createTestServerWithSession())
      .delete(PATH)
      .send(createBaseBody(calDavEvent));

    const { status } = response;

    assert.equal(status, 200);
  });
});
