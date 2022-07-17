import { MigrationInterface } from 'typeorm';
import ServerSettingsEntity from '../entity/ServerSettingsEntity';
import ServerSettingsRepository from '../repository/ServerSettingsRepository';

export class CreateServerSettings1659503032000 implements MigrationInterface {
  public async up(): Promise<void> {
    const serverSettingsAll =
      await ServerSettingsRepository.getRepository().find();
    const serverSettings = serverSettingsAll?.[0];

    if (!serverSettings) {
      const newServerSettings = new ServerSettingsEntity();
      await ServerSettingsRepository.getRepository().save(newServerSettings);
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
