import ImapService from "../../service/ImapService";

export const mockImapService = () => {
  ImapService.validateImapAccountData = async (body: any) => {
    return Promise.resolve(true)
  };
};
