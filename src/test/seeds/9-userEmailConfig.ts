import { Connection, MigrationInterface, getConnection } from 'typeorm';

import { testUserData } from './1-user-seed';
import UserEntity from '../../data/entity/UserEntity';
import UserEmailConfigEntity from '../../data/entity/UserEmailConfig';
import { CryptoAes } from '../../utils/CryptoAes';
import { UserEmailConfigData } from '../../bloben-interface/userEmailConfig/userEmailConfig';

export const userEmailConfigData: UserEmailConfigData = {
  smtpEmail: 'test@bloben.com',
  smtpHost: 'ebda',
  smtpPassword: 'asfasf',
  smtpPort: 100,
  smtpUsername: 'asfasf',
};

export class userEmailConfig implements MigrationInterface {
  public async up(): Promise<void> {
    const connection: Connection = await getConnection();

    const [user] = await Promise.all([
      connection.manager.findOne(UserEntity, {
        where: {
          username: testUserData.username,
        },
      }),
    ]);

    const data = await CryptoAes.encrypt(userEmailConfigData);

    const emailConfig = new UserEmailConfigEntity(user, data);

    await connection.manager.save(emailConfig);
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
