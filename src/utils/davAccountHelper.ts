import { CalDavAccount } from '../data/repository/CalDavAccountRepository';
import { DAVAccount } from 'tsdav';
import { createAuthHeader } from '../service/davService';

export interface DavRequestData {
  davAccount: DAVAccount;
  davHeaders: {
    authorization: string;
  };
}

export const getDavRequestData = (account: CalDavAccount): DavRequestData => {
  const { homeUrl, rootUrl, principalUrl, serverUrl } = account;

  return {
    davAccount: {
      homeUrl,
      rootUrl,
      principalUrl,
      serverUrl,
      accountType: account.accountType,
    },
    davHeaders: {
      authorization: createAuthHeader(account.username, account.password),
    },
  };
};
