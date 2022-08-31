import { AdminLoginRequest } from '../../../../bloben-interface/admin/admin';
import { LOG_TAG, SESSION } from '../../../../utils/enums';
import { ROLE } from '../../../../bloben-interface/enums';
import { Request } from 'express';
import { throwError } from '../../../../utils/errorCodes';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';
import logger from '../../../../utils/logger';

export const loginAdmin = async (req: Request): Promise<any> => {
  const body: AdminLoginRequest = req.body;
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

  const isMatchingPassword: boolean = await bcrypt.compare(password, user.hash);

  if (!isMatchingPassword) {
    logger.warn(`Admin login for username ${username} wrong password`, [
      LOG_TAG.REST,
      LOG_TAG.SECURITY,
    ]);

    throw throwError(401, 'Wrong username or password', req);
  }

  if (user.isTwoFactorEnabled) {
    return {
      isLogged: false,
      isTwoFactorEnabled: true,
    };
  }

  req.session[SESSION.USER_ID] = user.id;
  req.session[SESSION.ROLE] = user.role;

  req.session.save();

  return {
    isLogged: true,
    isTwoFactorEnabled: false,
  };
};
