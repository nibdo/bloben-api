import { AdminLoginRequest } from 'bloben-interface';
import { LOG_TAG } from '../../../../utils/enums';
import { ROLE } from '../../../../data/types/enums';
import { Request } from 'express';
import {
  addUserToSessionOnSuccessAuth,
  checkTrustedBrowser,
} from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';
import bcrypt from 'bcryptjs';
import logger from '../../../../utils/logger';

export const loginAdmin = async (req: Request): Promise<any> => {
  const body: AdminLoginRequest = req.body;
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

  const isMatchingPassword: boolean = await bcrypt.compare(password, user.hash);

  if (!isMatchingPassword) {
    logger.warn(`Admin login for username ${username} wrong password`, [
      LOG_TAG.REST,
      LOG_TAG.SECURITY,
    ]);

    throw throwError(401, 'Wrong username or password', req);
  }

  if (user.isTwoFactorEnabled) {
    // check if browser is trusted and does not need 2FA code
    const isTrustedBrowser = await checkTrustedBrowser(
      browserID,
      true,
      user.id
    );

    if (isTrustedBrowser) {
      addUserToSessionOnSuccessAuth(req, user);

      logger.info(`Admin with username ${user.username} login success`, [
        LOG_TAG.SECURITY,
      ]);
      return {
        isLogged: true,
        isTwoFactorEnabled: false,
      };
    }

    return {
      isLogged: false,
      isTwoFactorEnabled: true,
    };
  }

  addUserToSessionOnSuccessAuth(req, user);

  logger.info(`Admin with username ${user.username} login success`, [
    LOG_TAG.SECURITY,
  ]);

  return {
    isLogged: true,
    isTwoFactorEnabled: false,
  };
};
