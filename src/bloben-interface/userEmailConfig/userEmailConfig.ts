export interface UpdateUserEmailConfigRequest {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpEmail: string;
}

export interface GetUserEmailConfigResponse {
  hasSystemConfig: boolean;
  hasCustomConfig: boolean;
}

export type UserEmailConfigData = UpdateUserEmailConfigRequest;
