import { map } from 'lodash';

import { LOG_TAG } from '../../../utils/enums';

export const getLogTags = async (): Promise<LOG_TAG[]> => {
  return map(LOG_TAG, (tag) => tag);
};
