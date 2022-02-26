import { EntityRepository, Repository, getRepository } from 'typeorm';

import PushSubscriptionEntity from '../entity/PushSubscriptionEntity';

@EntityRepository(PushSubscriptionEntity)
export default class PushSubscriptionRepository extends Repository<PushSubscriptionEntity> {
  public static getRepository() {
    return getRepository(PushSubscriptionEntity);
  }

  public static async create(data: PushSubscriptionEntity) {
    return getRepository(PushSubscriptionEntity).save(data);
  }
}
