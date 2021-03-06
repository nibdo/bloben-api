import { GROUP_LOG_KEY, LOG_TAG } from '../../utils/enums';
import { forEach } from 'lodash';
import { redisClient } from '../../index';
import logger from '../../utils/logger';

export const groupLogsCronJob = async () => {
  const groupLogEnums = Object.entries(GROUP_LOG_KEY);

  const promises: any = [];

  forEach(groupLogEnums, (groupLogEnum) => {
    promises.push(redisClient.get(groupLogEnum[1]));
  });

  const resultPromises = await Promise.all(promises);

  forEach(resultPromises, (resultPromise) => {
    logger.info(resultPromise, [LOG_TAG.CRON]);
  });

  const cleanCachePromises: any = [];

  forEach(groupLogEnums, (groupLogEnum) => {
    cleanCachePromises.push(redisClient.del(groupLogEnum[1]));
  });

  await Promise.all(cleanCachePromises);
};
