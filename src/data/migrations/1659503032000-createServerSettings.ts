import { MigrationInterface } from 'typeorm';
import ServerSettingsEntity from '../entity/ServerSettingsEntity';
import ServerSettingsRepository from '../repository/ServerSettingsRepository';

export class CreateServerSettings1659503032000 implements MigrationInterface {
  public async up(): Promise<void> {
    const serverSettings =
      await ServerSettingsRepository.getRepository().findOne();

    if (!serverSettings) {
      const newServerSettings = new ServerSettingsEntity();
      await ServerSettingsRepository.getRepository().save(newServerSettings);
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
