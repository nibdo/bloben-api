import { initSeeds } from '../../../seeds/init';

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
} from '../../../../testHelpers/initTestServer';
import {invalidUUID} from "../../../../testHelpers/common";

const PATH = (id: string) => `/api/v1/public/calendars/${id}`;

describe(`Get public shared link [GET] ${PATH}`, async function () {
  let sharedLinkID;
  let sharedLinkDisabledID
  let sharedLinkExpiredID
  beforeEach(async () => {
    const { sharedLink, sharedLinkExpired, sharedLinkDisabled } =
      await initSeeds();

    sharedLinkID = sharedLink.id
    sharedLinkDisabledID = sharedLinkDisabled.id
    sharedLinkExpiredID = sharedLinkExpired.id
  });

  it('Should get status 404 wrong id', async function () {
    const response: any = await request(createTestServer()).get(PATH(invalidUUID));

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 404 expired', async function () {
    const response: any = await request(createTestServer()).get(PATH(sharedLinkExpiredID));

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 404 disabled', async function () {
    const response: any = await request(createTestServer()).get(PATH(sharedLinkDisabledID));

    const { status } = response;

    assert.equal(status, 404);
  });


  it('Should get status 200', async function () {
    const response: any = await request(createTestServer()).get(
      PATH(sharedLinkID)
    );

    const { status } = response;

    assert.equal(status, 200);
  });
});
