import { GROUP_LOG_KEY } from '../../utils/enums';
import { Job } from 'bullmq';
import { groupBy } from 'lodash';
import { syncAllCardDav } from '../../utils/davHelper';
import CalDavAccountRepository, {
  CardDavAccountWithAddressBooks,
} from '../../data/repository/CalDavAccountRepository';
import Logger, { groupLogs } from '../../utils/logger';

export const syncCardDavQueueJob = async (job: Job): Promise<void> => {
  try {
    const { data } = job;

    if (!data.userID) {
      return;
    }

    await groupLogs(
      GROUP_LOG_KEY.CARDDAV_JOB,
      `syncCardDavQueueJob starts for userID ${data.userID}`
    );

    // get calDav accounts
    const calDavAccounts = await CalDavAccountRepository.getCardDavAccounts(
      data.userID
    );

    // group by userID
    const groupedByUserID: any = groupBy(calDavAccounts, 'userID');

    for (const [userID, items] of Object.entries(groupedByUserID)) {
      // sync items
      await syncAllCardDav(userID, items as CardDavAccountWithAddressBooks[]);
    }
  } catch (e) {
    Logger.error('syncCardDavQueueJob error', e);
  }
};
