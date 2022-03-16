export interface UpdateUserEmailConfigRequest {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpEmail: string;
}

export interface GetUserEmailConfigResponse
  extends UpdateUserEmailConfigRequest {
  isSystemConfig: boolean;
}
export type UserEmailConfigData = UpdateUserEmailConfigRequest;
