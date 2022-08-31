import { Request } from 'express';
import { authenticator } from 'otplib';

import { LoginResponse } from '../../../../bloben-interface/user/user';
import { LoginWithTwoFactorRequest } from '../../../../bloben-interface/2fa/2fa';
import { REDIS_PREFIX, SESSION } from '../../../../utils/enums';
import { throwError } from '../../../../utils/errorCodes';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';

export const loginWithTwoFactor = async (
  req: Request
): Promise<LoginResponse> => {
  const body: LoginWithTwoFactorRequest = req.body;

  const userID: string = req.session[REDIS_PREFIX.USER_ID_KEY_2FA];

  const user: UserEntity | undefined = await UserRepository.findById(userID);

  if (!user) {
    throw throwError(404, 'User not found', req);
  }

  if (!user.isTwoFactorEnabled) {
    throw throwError(409, 'Two factor not enabled', req);
  }

  // verify otp code
  const isValidCode: boolean = authenticator.check(
    body.otpCode,
    user.twoFactorSecret
  );

  if (!isValidCode) {
    throw throwError(409, 'Wrong code', req);
  }

  // Save userID to session
  req.session[SESSION.USER_ID] = user.id;
  req.session[SESSION.ROLE] = user.role;
  req.session[SESSION.SRP_SESSION_KEY] = '';

  req.session.save();

  return {
    message: 'Login successful',
    isLogged: true,
    isTwoFactorEnabled: true,
  };
};
