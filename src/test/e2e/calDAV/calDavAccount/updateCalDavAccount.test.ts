import { initSeeds } from '../../seeds/init';
import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import {invalidUUID} from "../../../testHelpers/common";

const request = require('supertest');
const assert = require('assert');

const PATH = (id: string) => `/api/v1/caldav-accounts/${id}`;

describe(`[E2E] Update calDav account [PUT] ${PATH}`, async function () {
  let calDavAccountID;

  beforeEach(async () => {
    const { calDavAccount } = await initSeeds();
    calDavAccountID = calDavAccount.id;
  });

  it('Should get status 409', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .put(PATH(calDavAccountID))
      .send({
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 404 not found', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .put(PATH(invalidUUID))
      .send({
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .put(PATH(calDavAccountID))
      .send({
        password: 'tester',
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
