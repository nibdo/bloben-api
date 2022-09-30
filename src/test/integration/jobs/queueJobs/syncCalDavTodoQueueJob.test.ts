import {
  initSyncCalDavTodoQueueJobData,
  todoToDeleteID,
  todoToInsertID,
  todoToKeepID,
  todoToUpdateID,
} from './syncCalDavTodoQueueJob.seed';
import { mockTsDav } from '../../../__mocks__/tsdav';
import { syncCalDavTaskQueueJob } from '../../../../jobs/queueJobs/syncCalDavTaskQueueJob';
import CalDavTaskRepository from '../../../../data/repository/CalDavTaskRepository';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');

describe(`syncCalDavTaskQueueJob [QUEUE]`, async function () {
  let userID: string;
  const accountUrl = 'http://localhost:3000';

  beforeEach(async () => {
    const user = await initSyncCalDavTodoQueueJobData(accountUrl);

    userID = user.id;
  });

  it('Should insert new task', async function () {
    await syncCalDavTaskQueueJob({
      data: { userID },
    } as any);

    const todo = await CalDavTaskRepository.getRepository().findOne({
      where: {
        externalID: todoToInsertID,
      },
    });

    assert.equal(todo.externalID, todoToInsertID);
  });

  it('Should keep not changed task', async function () {
    await syncCalDavTaskQueueJob({
      data: { userID },
    } as any);

    const todo = await CalDavTaskRepository.getRepository().findOne({
      where: {
        externalID: todoToKeepID,
      },
    });

    assert.equal(todo.externalID, todoToKeepID);
    assert.equal(todo.summary, 'Old value');
    assert.equal(todo.etag, 'FGHBAFJi123');
  });

  it('Should update changed task', async function () {
    mockTsDav();

    await syncCalDavTaskQueueJob({
      data: { userID },
    } as any);

    const todo = await CalDavTaskRepository.getRepository().findOne({
      where: {
        externalID: todoToUpdateID,
      },
    });

    assert.equal(todo.externalID, todoToUpdateID);
    assert.equal(todo.summary, 'New value');
  });

  it('Should delete remote task', async function () {
    mockTsDav();

    await syncCalDavTaskQueueJob({
      data: { userID },
    } as any);

    const todo = await CalDavTaskRepository.getRepository().findOne({
      where: {
        externalID: todoToDeleteID,
      },
    });

    assert.notEqual(todo.deletedAt, null);
  });
});
