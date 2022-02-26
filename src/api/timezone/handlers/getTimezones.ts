import { map } from 'lodash';

import TimezoneEntity from '../../../data/entity/TimezoneEntity';
import TimezoneRepository from '../../../data/repository/TimezoneRepository';

export const getTimezones = async (): Promise<string[]> => {
  const timezones: TimezoneEntity[] = await TimezoneRepository.findAll();

  return map(timezones, (timezone: TimezoneEntity) => timezone.name);
};
