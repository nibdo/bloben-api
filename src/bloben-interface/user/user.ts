import { ROLE } from '../enums';

export interface RegisterResponse {
  message: string;
  isLogged: boolean;
  isEnabled: boolean;
  isTwoFactorEnabled: boolean;
}

export interface RegisterRequest {
  username: string;
  password: string;
  calendar: {
    id: string;
    data: string;
    createdAt: string;
    updatedAt: string;
    color: string;
    timezone: string;
  };
  cryptoPassword: string;
  publicKey: string;
  privateKey: string;
  notificationSettings: {
    publicKey: string;
    privateKey: string;
    password: string;
  };
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  role: ROLE;
}

export interface LoginRequest {
  username: string;
  password: string;
}
export interface LoginDemoRequest {
  username: string;
  password: string;
  redirect: string;
}
export interface LoginResponse {
  message: string;
  isLogged: boolean;
  isTwoFactorEnabled: boolean;
}

export interface LoginWithTwoFactorRequest {
  otpCode: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface GetSessionResponse {
  isLogged: boolean;
  userID: string;
  username: string;
}

export interface GetAccountResponse {
  username: string;
  userID: string;
  role: ROLE;
}

export interface GetTwoFactorSecretResponse {
  twoFactorSecret: string;
}

export interface GetTwoFactorResponse {
  isEnabled: boolean;
}

export interface AddEmailRequest {
  email: string;
}
