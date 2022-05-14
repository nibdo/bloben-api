import { CreateCalDavAccountRequest } from "../../../../../bloben-interface/calDavAccount/calDavAccount";

const request = require("supertest");
const assert = require("assert");
import {
    createTestServer,
    createTestServerWithSession
} from "../../../../testHelpers/initTestServer";
import { initSeeds } from "../../../seeds/init";
import {initCalDavMock} from "../../../../__mocks__/calDavMock";
import {mockTsDav, mockTsDavUnauthorized} from "../../../../__mocks__/tsdav";
import {ImportMock} from "ts-mock-imports";

const PATH = "/api/v1/caldav-accounts";

describe(`Create calDav account [POST] ${PATH}`, async function() {

    let mockManager

    before(async () => {
        mockManager = initCalDavMock()
    });

    beforeEach(async () => {
        await initSeeds();
    });

    it("Should get status 401", async function() {
        const response: any = await request(createTestServer())
            .post(PATH)
            .send({
                username: "abecede",
                password: "fefefefaasfaf",
                url: "http://localhost"
            } as CreateCalDavAccountRequest);

        const { status } = response;

        assert.equal(status, 401);
    });

    it("Should get status 409 already exists", async function() {
        await request(createTestServerWithSession())
            .post(PATH)
            .send({
                username: "abecede",
                password: "fefefefaasfaf",
                url: "http://localhost:3111"
            } as CreateCalDavAccountRequest);

        const response: any = await request(createTestServerWithSession())
            .post(PATH)
            .send({
                username: "abecede",
                password: "fefefefaasfaf",
                url: "http://localhost:3111"
            } as CreateCalDavAccountRequest);

        const { status } = response;

        assert.equal(status, 409);
    });

    it("Should get status 409 cannot connect to calDav server", async function() {
        ImportMock.restore()
        mockManager = mockTsDavUnauthorized()

        const response: any = await request(createTestServerWithSession())
            .post(PATH)
            .send({
                username: "abecede",
                password: "fefefefaasfaf",
                url: "http://localhost:3111"
            } as CreateCalDavAccountRequest);

        const { status } = response;

        assert.equal(status, 409);

        ImportMock.restore()
        mockManager = mockTsDav()
    });

    it("Should get status 403 Forbidden", async function() {
        const response: any = await request(createTestServerWithSession(true))
            .post(PATH)
            .send({
                username: "abecede",
                password: "fefefefaasfaf",
                url: "http://localhost"
            } as CreateCalDavAccountRequest);

        const { status } = response;

        assert.equal(status, 403);
    });

    it("Should get status 200", async function() {
        const response: any = await request(createTestServerWithSession())
            .post(PATH)
            .send({
                username: "abecede",
                password: "fefefefaasfaf",
                url: "http://localhost"
            } as CreateCalDavAccountRequest);

        const { status } = response;

        assert.equal(status, 200);
    });
});
