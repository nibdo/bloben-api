import { CreatePushSubscriptionRequest } from '../../../../api/pushSubscription/PushSubscriptionInterface';

const request = require('supertest');
const assert = require('assert');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../utils/initTestServer';
import {initSeeds} from "../../../seeds/init";

const PATH = `/api/v1/push/subscription`;

const pushSubscriptionData: CreatePushSubscriptionRequest = {
  subscription: {
    keys: {
      auth: 'adasd',
      p256dh: 'asdasd',
    },
    endpoint: 'adasd',
  },
};

describe(`Create push subscription [POST] ${PATH}`, async function () {

  beforeEach(async () => {
    await initSeeds();
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .post(PATH)
      .send(pushSubscriptionData);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(true))
        .post(PATH)
        .send(pushSubscriptionData);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession())
      .post(PATH)
      .send(pushSubscriptionData);

    const { status } = response;

    assert.equal(status, 200);
  });
});
