export interface SmtpData {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
}

export interface ImapData {
  imapHost: string;
  imapPort: number;
  imapUsername: string;
  imapPassword: string;
}

export interface UserEmailConfigDecryptedData {
  smtp?: SmtpData;
  imap?: ImapData;
}

export interface UpdateUserEmailConfigRequest
  extends UserEmailConfigDecryptedData {
  imapSyncingInterval?: number;
  aliases: string[];
  defaultAlias: string;
  calendarForImportID: string | null;
}

export interface CreateUserEmailConfigRequest
  extends UserEmailConfigDecryptedData {
  imapSyncingInterval?: number;
  aliases: string[];
  defaultAlias: string;
  calendarForImportID: string | null;
}

export interface EmailConfigData {
  id: string;
  smtp: SmtpData | null;
  imap: ImapData | null;
  aliases: string[];
  defaultAlias: string;
  isDefault: boolean;
  calendarForImportID: string | null;
}

export interface GetUserEmailConfigResponse {
  hasSystemConfig: boolean;
  hasCustomConfig: boolean;
  configs: EmailConfigData[];
}

export type UserEmailConfigData = UpdateUserEmailConfigRequest;

export interface ImapAuth {
  user: string;
  pass: string;
}

export interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: ImapAuth;
}

export interface PatchUserEmailConfigRequest {
  isDefault: boolean;
}
