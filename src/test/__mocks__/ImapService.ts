import ImapService from '../../service/ImapService';

export const mockImapService = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ImapService.validateImapAccountData = async (body: any) => {
    return Promise.resolve(true);
  };
  ImapService.getEmails = async () => {
    return Promise.resolve({} as any);
  };
};
