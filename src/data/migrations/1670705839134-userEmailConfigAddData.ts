import { CryptoAes } from '../../utils/CryptoAes';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { UserEmailConfigDecryptedData } from 'bloben-interface';
import { env } from '../../index';
import UserEmailConfigEntity from '../entity/UserEmailConfig';

export class userEmailConfigAddData1670705839134 implements MigrationInterface {
  name = 'userEmailConfigAddData1670705839134';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const userEmailConfigs: { data: string; userID: string }[] =
      await queryRunner.manager.getRepository(UserEmailConfigEntity).query(`
             SELECT 
              ec.data as data,
              ec.user_id as "userID"
      FROM user_email_config ec
      WHERE
        ec.data IS NOT NULL
      `);

    if (userEmailConfigs.length) {
      for (const userEmailConfig of userEmailConfigs) {
        if (userEmailConfig.data) {
          if (!env.encryptionPassword) {
            throw Error('Need to add encryption password to .env');
          }

          const userEmailConfigData: UserEmailConfigDecryptedData =
            await CryptoAes.decrypt(userEmailConfig.data);

          const dataToUpdate: any = {};

          // @ts-ignore
          if (userEmailConfigData?.smtp?.smtpEmail) {
            // @ts-ignore
            dataToUpdate.aliases = [userEmailConfigData.smtp.smtpEmail];
            dataToUpdate.isDefault = true;
            // @ts-ignore
            dataToUpdate.defaultAlias = userEmailConfigData.smtp.smtpEmail;

            await queryRunner.manager.update(
              UserEmailConfigEntity,
              {
                userID: userEmailConfig.userID,
              },
              dataToUpdate
            );
          }
        }
      }
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
