import { CalDavCacheService } from '../service/CalDavCacheService';
import { forEach, groupBy } from 'lodash';
import { getCurrentRangeForSync } from '../utils/common';
import CalDavAccountRepository from '../data/repository/CalDavAccountRepository';
import logger from '../utils/logger';

export const cacheCalDavJob = async (): Promise<void> => {
  logger.info('[CRON Cache CalDav]: Starts');
  // get calDav accounts
  const calDavAccounts: any = await CalDavAccountRepository.getCalDavAccounts();

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

  logger.info('[CRON Cache CalDav]: Ends');
};
