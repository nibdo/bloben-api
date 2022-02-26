import { EntityRepository, Repository, getRepository } from 'typeorm';

import WebcalCalendarEntity from '../entity/WebcalCalendarEntity';

@EntityRepository(WebcalCalendarEntity)
export default class WebcalCalendarRepository extends Repository<WebcalCalendarEntity> {
  public static getRepository() {
    return getRepository(WebcalCalendarEntity);
  }

  public static findByIdAndUserID = async (
    id: string,
    userID: string
  ): Promise<WebcalCalendarEntity | undefined> => {
    return WebcalCalendarRepository.getRepository()
      .createQueryBuilder('wc')
      .select('wc.id')
      .leftJoin('wc.user', 'u')
      .where('wc.id = :id', { id })
      .andWhere('u.id = :userID', { userID })
      .getOne();
  };
}
