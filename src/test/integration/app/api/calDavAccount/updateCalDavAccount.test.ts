import { mockTsDav, mockTsDavUnauthorized } from "../../../../__mocks__/tsdav";

const request = require("supertest");
const assert = require("assert");
import {
  createTestServer,
  createTestServerWithSession,
} from "../../../../testHelpers/initTestServer";
import { initSeeds } from "../../../seeds/init";
import { initCalDavMock } from "../../../../__mocks__/calDavMock";
import { ImportMock } from "ts-mock-imports";
import {invalidUUID} from "../../../../testHelpers/common";

const PATH = (id: string) => `/api/v1/caldav-accounts/${id}`;

describe(`Update calDav account [PUT] ${PATH}`, async function () {
  let calDavAccountID;

  let mockManager;

  before(async () => {
    mockManager = initCalDavMock();
  });

  beforeEach(async () => {
    const { calDavAccount } = await initSeeds();
    calDavAccountID = calDavAccount.id;
  });

  it("Should get status 401", async function () {
    const response: any = await request(createTestServer())
      .put(PATH(calDavAccountID))
      .send({
        password: "abcde",
      });

    const { status } = response;

    assert.equal(status, 401);
  });

  it("Should get status 404 not found", async function () {
    const response: any = await request(createTestServerWithSession())
      .put(PATH(invalidUUID))
      .send({
        password: "abcde",
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it("Should get status 409 cannot connect to calDav server", async function () {
    ImportMock.restore();
    mockManager = mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession())
      .put(PATH(calDavAccountID))
      .send({
        password: "abcde",
      });

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockManager = mockTsDav();
  });

  it("Should get status 403 forbidden", async function () {
    const response: any = await request(createTestServerWithSession(true))
        .put(PATH(calDavAccountID))
        .send({
          password: "abcde",
        });

    const { status } = response;

    assert.equal(status, 403);
  });

  it("Should get status 200", async function () {
    const response: any = await request(createTestServerWithSession())
      .put(PATH(calDavAccountID))
      .send({
        password: "abcde",
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
