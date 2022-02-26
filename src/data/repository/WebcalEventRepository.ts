import { EntityRepository, Repository, getRepository } from 'typeorm';

import WebcalEventEntity from '../entity/WebcalEventEntity';

@EntityRepository(WebcalEventEntity)
export default class WebcalEventRepository extends Repository<WebcalEventEntity> {
  public static getRepository() {
    return getRepository(WebcalEventEntity);
  }
}
