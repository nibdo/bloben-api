import { Request } from 'express';
import { authenticator } from 'otplib';

import { LOG_TAG } from '../../../../../utils/enums';
import { LoginResponse, LoginWithTwoFactorRequest } from 'bloben-interface';
import { ROLE } from '../../../../../data/types/enums';
import { addUserToSessionOnSuccessAuth } from '../../../../../utils/common';
import { throwError } from '../../../../../utils/errorCodes';
import UserEntity from '../../../../../data/entity/UserEntity';
import UserRepository from '../../../../../data/repository/UserRepository';
import bcrypt from 'bcryptjs';
import logger from '../../../../../utils/logger';

export const loginWithTwoFactor = async (
  req: Request
): Promise<LoginResponse> => {
  const body: LoginWithTwoFactorRequest = req.body;

  const { username, password } = body;

  const user: UserEntity | undefined =
    await UserRepository.getRepository().findOne({
      where: {
        username: username as string,
        role: ROLE.USER,
      },
    });

  if (!user) {
    logger.warn(`Login for unknown username ${username}`, [
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
    throw throwError(409, 'Wrong code', req);
  }

  addUserToSessionOnSuccessAuth(req, user);

  return {
    message: 'Login successful',
    isLogged: true,
    isTwoFactorEnabled: true,
  };
};
