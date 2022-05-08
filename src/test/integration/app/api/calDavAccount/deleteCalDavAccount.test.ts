import {invalidUUID} from "../../../../testHelpers/common";

const request = require("supertest");
const assert = require("assert");
import {
    createTestServer,
    createTestServerWithSession
} from "../../../../testHelpers/initTestServer";
import { initSeeds } from "../../../seeds/init";

const PATH = (id: string) => `/api/v1/caldav-accounts/${id}`;

describe(`Delete calDav account [DELETE] ${PATH}`, async function() {

    let calDavAccountID

  beforeEach(async () => {
      const {calDavAccount} = await initSeeds();
      calDavAccountID = calDavAccount.id
  });

    it("Should get status 401", async function() {
        const response: any = await request(createTestServer())
            .delete(PATH(calDavAccountID))
            .send();

        const { status } = response;

        assert.equal(status, 401);
    });

    it("Should get status 404 not found", async function() {
        const response: any = await request(createTestServerWithSession())
            .delete(PATH(invalidUUID))
            .send();

        const { status } = response;

        assert.equal(status, 404);
    });

    it("Should get status 403 Forbidden", async function() {
        const response: any = await request(createTestServerWithSession(true))
            .delete(PATH(calDavAccountID))
            .send();

        const { status } = response;

        assert.equal(status, 403);
    });

  it("Should get status 200", async function() {
    const response: any = await request(createTestServerWithSession())
        .delete(PATH(calDavAccountID))
        .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
