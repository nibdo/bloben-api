import { EntityRepository, Repository, getRepository } from 'typeorm';

import ServerSettingsEntity from '../entity/ServerSettingsEntity';

@EntityRepository(ServerSettingsEntity)
export default class ServerSettingsRepository extends Repository<ServerSettingsEntity> {
  public static getRepository() {
    return getRepository(ServerSettingsEntity);
  }
}
