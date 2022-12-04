import { CryptoAes } from '../../../utils/CryptoAes';
import { UserEmailConfigData } from 'bloben-interface';
import UserEmailConfigEntity from '../../../data/entity/UserEmailConfig';
import UserEmailConfigRepository from '../../../data/repository/UserEmailConfigRepository';

export const userEmailConfigData: UserEmailConfigData = {
  imapSyncingInterval: 15,
  smtp: {
    smtpEmail: 'test@bloben.com',
    smtpHost: 'ebda',
    smtpPassword: 'asfasf',
    smtpPort: 100,
    smtpUsername: 'asfasf',
  },
  imap: {
    imapHost: 'abd',
    imapPort: 100,
    imapPassword: 'abd',
    imapUsername: 'abd',
  },
};

export const seedUserEmailConfig = async (
  userID: string,
  calendarForImportID?: string
) => {
  const data = await CryptoAes.encrypt(userEmailConfigData);

  const emailConfig = new UserEmailConfigEntity(userID, data, 15, false);

  if (calendarForImportID) {
    emailConfig.calendarForImportID = calendarForImportID;
  }

  await UserEmailConfigRepository.getRepository().save(emailConfig);
};
