import {
  initSyncCardDavQueueJobData,
  vcalToDeleteID,
  vcalToInsertID,
  vcalToKeepID,
  vcalToUpdateID,
} from './syncCardDavQueueJob.seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
import { syncCardDavQueueJob } from '../../../../../jobs/queueJobs/syncCardDavQueueJob';
import { todoToUpdateID } from './syncCalDavTodoQueueJob.seed';
import CardDavContactRepository from '../../../../../data/repository/CardDavContactRepository';

describe(`syncCardDavQueueJob [QUEUE]`, async function () {
  let userID: string;
  const accountUrl = 'http://localhost:3000';

  beforeEach(async () => {
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

    const items = await CardDavContactRepository.getRepository().query(
      `
      SELECT 
        c.id
      FROM carddav_contacts c
      INNER JOIN carddav_address_books ab ON c.carddav_address_book_id = ab.id
      INNER JOIN caldav_accounts ca ON ca.id = ab.caldav_account_id
      WHERE
        c.external_id = $1
        AND ca.user_id = $2
    `,
      [vcalToDeleteID, userID]
    );

    assert.notEqual(items.length, 0);
  });
});
