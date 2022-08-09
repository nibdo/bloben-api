import {
  initSyncCardDavQueueJobData,
  vcalToDeleteID,
  vcalToInsertID,
  vcalToKeepID,
  vcalToUpdateID,
} from './syncCardDavQueueJob.seed';

const assert = require('assert');
import { initDatabase } from '../../../../testHelpers/initDatabase';
import { todoToUpdateID } from './syncCalDavTodoQueueJob.seed';
import { syncCardDavQueueJob } from '../../../../../jobs/queueJobs/syncCardDavQueueJob';
import CardDavContactRepository from '../../../../../data/repository/CardDavContactRepository';

describe(`syncCardDavQueueJob [QUEUE]`, async function () {
  let userID: string;
  const accountUrl = 'http://localhost:3000';

  beforeEach(async () => {
    await initDatabase();
    const user = await initSyncCardDavQueueJobData(accountUrl);

    userID = user.id;
  });

  it('Should insert new contact', async function () {
    await syncCardDavQueueJob({
      data: { userID },
    } as any);

    const item = await CardDavContactRepository.getRepository().findOne({
      where: {
        externalID: vcalToInsertID,
      },
    });

    assert.equal(item.externalID, vcalToInsertID);
  });

  it('Should keep not changed contact', async function () {
    await syncCardDavQueueJob({
      data: { userID },
    } as any);

    const item = await CardDavContactRepository.getRepository().findOne({
      where: {
        externalID: vcalToKeepID,
      },
    });

    assert.equal(item.externalID, vcalToKeepID);
    assert.equal(item.etag, 'FGHBAFJi123');
  });

  it('Should update changed contact', async function () {
    await syncCardDavQueueJob({
      data: { userID },
    } as any);

    const item = await CardDavContactRepository.getRepository().findOne({
      where: {
        externalID: vcalToUpdateID,
      },
    });

    assert.equal(item.externalID, todoToUpdateID);
  });

  it('Should delete remote contact', async function () {
    await syncCardDavQueueJob({
      data: { userID },
    } as any);

    const item = await CardDavContactRepository.getRepository().findOne({
      where: {
        externalID: vcalToDeleteID,
      },
    });

    assert.notEqual(item.deletedAt, null);
  });
});
