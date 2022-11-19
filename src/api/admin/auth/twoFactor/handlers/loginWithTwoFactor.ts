import { Request } from 'express';
import { authenticator } from 'otplib';

import { LOG_TAG, REDIS_PREFIX } from '../../../../../utils/enums';
import {
  LoginWithTwoFactorAdminResponse,
  LoginWithTwoFactorRequest,
} from 'bloben-interface';
import { ROLE } from '../../../../../data/types/enums';
import {
  TRUSTED_BROWSER_EXPIRATION,
  addUserToSessionOnSuccessAuth,
} from '../../../../../utils/common';
import { getTrustedBrowserRedisKey } from '../../../../../service/RedisService';
import { redisClient } from '../../../../../index';
import { throwError } from '../../../../../utils/errorCodes';
import UserEntity from '../../../../../data/entity/UserEntity';
import UserRepository from '../../../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';
import logger from '../../../../../utils/logger';

export const loginWithTwoFactor = async (
  req: Request
): Promise<LoginWithTwoFactorAdminResponse> => {
  const body: LoginWithTwoFactorRequest = req.body;

  const { username, password, browserID } = body;

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

  addUserToSessionOnSuccessAuth(req, user);

  // save browserID as trusted to disable 2FA
  if (browserID) {
    await redisClient.set(
      getTrustedBrowserRedisKey(
        REDIS_PREFIX.BROWSER_ID_ADMIN,
        user.id,
        browserID
      ),
      browserID,
      'EX',
      TRUSTED_BROWSER_EXPIRATION
    );
  }

  logger.info(`Admin with username ${user.username} login success`, [
    LOG_TAG.SECURITY,
  ]);

  return {
    message: 'Login successful',
    isLogged: true,
    isTwoFactorEnabled: true,
  };
};
