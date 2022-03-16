const request = require("supertest");
const assert = require("assert");
import {
  createTestServer,
  createTestServerWithSession,
} from "../../../utils/initTestServer";
import { initSeeds } from "../../../seeds/init";
import { initCalDavMock } from "../../../__mocks__/calDavMock";
import { mockTsDav, mockTsDavUnauthorized } from "../../../__mocks__/tsdav";
import { ImportMock } from "ts-mock-imports";
import {
  createDummyCalDavEvent,
  createDummyCalDavEventWithAttendees
} from "../../../seeds/4-calDavEvents";
import { invalidUUID } from "../adminUsers/adminUpdateUser.test";

const PATH = "/api/v1/caldav-events";

describe(`Create calDav event [POST] ${PATH}`, async function () {
  let mockManager;
  let requestBody;
  let requestBodyAttendees;
  before(async () => {
    mockManager = initCalDavMock();
  });

  beforeEach(async () => {
    const { calDavCalendar } = await initSeeds();
    requestBody = createDummyCalDavEvent(calDavCalendar.id);
    requestBodyAttendees = createDummyCalDavEventWithAttendees(calDavCalendar.id)
  });
  //
  it("Should get status 401", async function () {
    const response: any = await request(createTestServer())
      .post(PATH)
      .send(requestBody);

    const { status } = response;

    assert.equal(status, 401);
  });

  it("Should get status 404 not found", async function () {
    await request(createTestServerWithSession()).post(PATH).send(requestBody);

    const response: any = await request(createTestServerWithSession())
      .post(PATH)
      .send({ ...requestBody, calendarID: invalidUUID });

    const { status } = response;

    assert.equal(status, 404);
  });

  it("Should get status 409 cannot connect to calDav server", async function () {
    ImportMock.restore();
    mockManager = mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession())
      .post(PATH)
      .send(requestBody);

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockManager = mockTsDav();
  });

  it("Should get status 403 forbidden", async function () {
    const response: any = await request(createTestServerWithSession(true))
        .post(PATH)
        .send(requestBody);

    const { status } = response;

    assert.equal(status, 403);
  });

  it("Should get status 200", async function () {
    const response: any = await request(createTestServerWithSession())
      .post(PATH)
      .send(requestBody);

    const { status } = response;

    assert.equal(status, 200);
  });

  it("Should get status 200 with attendees", async function () {
    const response: any = await request(createTestServerWithSession())
        .post(PATH)
        .send(requestBodyAttendees);

    const { status } = response;

    assert.equal(status, 200);
  });
});
