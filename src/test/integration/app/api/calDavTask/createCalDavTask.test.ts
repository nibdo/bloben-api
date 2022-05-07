import {createDummyCalDavTask} from "../../../seeds/7-calDavTasks";

const request = require("supertest");
const assert = require("assert");
import {
  createTestServer,
  createTestServerWithSession,
} from "../../../../testHelpers/initTestServer";
import { initSeeds } from "../../../seeds/init";
import { initCalDavMock } from "../../../../__mocks__/calDavMock";
import { mockTsDav, mockTsDavUnauthorized } from "../../../../__mocks__/tsdav";
import { ImportMock } from "ts-mock-imports";
import {invalidUUID} from "../../../../testHelpers/common";

const PATH = "/api/v1/caldav-tasks";

describe(`Create calDav task [POST] ${PATH}`, async function () {
  let mockManager;
  let requestBody;
  before(async () => {
    mockManager = initCalDavMock();
  });

  beforeEach(async () => {
    const { calDavCalendar } = await initSeeds();
    requestBody = createDummyCalDavTask(calDavCalendar.id);
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
});
