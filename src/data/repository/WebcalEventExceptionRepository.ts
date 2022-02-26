import { EntityRepository, Repository, getRepository } from 'typeorm';

import WebcalEventExceptionEntity from '../entity/WebcalEventExceptionEntity';

@EntityRepository(WebcalEventExceptionEntity)
export default class WebcalEventExceptionRepository extends Repository<WebcalEventExceptionEntity> {
  public static getRepository() {
    return getRepository(WebcalEventExceptionEntity);
  }
}
