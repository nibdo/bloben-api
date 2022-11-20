import { CalDavAccount } from '../data/repository/CalDavAccountRepository';
import { DAVAccount } from 'tsdav';
import { createAuthHeader } from '../service/davService';

export interface DavHeaders {
  authorization: string;
  [key: string]: string;
}

export interface DavRequestData {
  davAccount: DAVAccount;
  davHeaders: DavHeaders;
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
