import { CryptoAes } from '../../../utils/CryptoAes';
import { UpdateUserEmailConfigRequest } from 'bloben-interface';
import UserEmailConfigEntity from '../../../data/entity/UserEmailConfig';
import UserEmailConfigRepository from '../../../data/repository/UserEmailConfigRepository';

export const userEmailConfigData: UpdateUserEmailConfigRequest = {
  imapSyncingInterval: 15,
  smtp: {
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
  aliases: ['to@bloben.com'],
  defaultAlias: 'to@bloben.com',
  calendarForImportID: null,
};

export const seedUserEmailConfig = async (
  userID: string,
  calendarForImportID?: string
) => {
  const data = await CryptoAes.encrypt({
    smtp: userEmailConfigData.smtp,
    imap: userEmailConfigData.imap,
  });

  const emailConfig = new UserEmailConfigEntity(
    userID,
    data,
    userEmailConfigData,
    false
  );

  if (calendarForImportID) {
    emailConfig.calendarForImportID = calendarForImportID;
  }

  await UserEmailConfigRepository.getRepository().save(emailConfig);

  return emailConfig;
};
