import { Request } from 'express';
import { authenticator } from 'otplib';

import { LOG_TAG, SESSION } from '../../../../../utils/enums';
import {
  LoginWithTwoFactorAdminResponse,
  LoginWithTwoFactorRequest,
} from '../../../../../bloben-interface/2fa/2fa';
import { ROLE } from '../../../../../bloben-interface/enums';
import { throwError } from '../../../../../utils/errorCodes';
import UserEntity from '../../../../../data/entity/UserEntity';
import UserRepository from '../../../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';
import logger from '../../../../../utils/logger';

export const loginWithTwoFactor = async (
  req: Request
): Promise<LoginWithTwoFactorAdminResponse> => {
  const body: LoginWithTwoFactorRequest = req.body;

  const { username, password } = body;

  const user: UserEntity | undefined =
    await UserRepository.getRepository().findOne({
      where: {
        username: username as string,
        role: ROLE.ADMIN,
      },
    });

  if (!user) {
    logger.warn(`Admin login for unknown username ${username}`, [
      LOG_TAG.REST,
      LOG_TAG.SECURITY,
    ]);

    throw throwError(401, 'Wrong username or password', req);
  }

  if (!user.isTwoFactorEnabled) {
    throw throwError(409, 'Two factor not enabled', req);
  }

  const isMatchingPassword: boolean = await bcrypt.compare(password, user.hash);

  if (!isMatchingPassword) {
    logger.warn(`Admin login for username ${username} wrong password`, [
      LOG_TAG.REST,
      LOG_TAG.SECURITY,
    ]);

    throw throwError(401, 'Wrong username or password', req);
  }

  // verify otp code
  const isValidCode: boolean = authenticator.check(
    body.otpCode,
    user.twoFactorSecret
  );

  if (!isValidCode) {
    logger.warn(`Admin login wrong OTP code with username ${username}`, [
      LOG_TAG.REST,
      LOG_TAG.SECURITY,
    ]);
    throw throwError(409, 'Wrong code', req);
  }

  req.session[SESSION.USER_ID] = user.id;
  req.session[SESSION.ROLE] = user.role;

  req.session.save();

  return {
    message: 'Login successful',
    isLogged: true,
    isTwoFactorEnabled: true,
  };
};
