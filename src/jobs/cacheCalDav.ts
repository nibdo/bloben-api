import { CalDavCacheService } from '../service/CalDavCacheService';
import { LOG_TAG } from '../utils/enums';
import { forEach, groupBy } from 'lodash';
import { getCurrentRangeForSync } from '../utils/common';
import CalDavAccountRepository from '../data/repository/CalDavAccountRepository';
import logger from '../utils/logger';

export const cacheCalDavJob = async (): Promise<void> => {
  try {
    logger.info('Cache CalDav events starts', [LOG_TAG.CRON, LOG_TAG.CALDAV]);
    // get calDav accounts
    const calDavAccounts: any =
      await CalDavAccountRepository.getCalDavAccounts();

    // group by userID
    const groupedByUserID: any = groupBy(calDavAccounts, 'userID');

    const promises: any = [];

    forEach(groupedByUserID, (items, userID) => {
      promises.push(
        CalDavCacheService.fetchNewCacheData(
          userID,
          items,
          getCurrentRangeForSync()
        )
      );
    });

    await Promise.allSettled(promises);
  } catch (e) {
    logger.error(`Error cache CalDav events: ${JSON.stringify(e)}`, [
      LOG_TAG.CRON,
      LOG_TAG.CALDAV,
    ]);
  }
};
