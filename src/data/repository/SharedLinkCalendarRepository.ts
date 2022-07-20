import { EntityRepository, Repository, getRepository } from 'typeorm';

import SharedLinkCalendarEntity from '../entity/SharedLinkCalendars';

@EntityRepository(SharedLinkCalendarEntity)
export default class SharedLinkCalendarRepository extends Repository<SharedLinkCalendarEntity> {
  public static getRepository() {
    return getRepository(SharedLinkCalendarEntity);
  }
}
