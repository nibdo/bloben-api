import { Request } from 'express';

import { LOG_TAG, REDIS_PREFIX } from '../../../../utils/enums';
import { LoginRequest, LoginResponse } from 'bloben-interface';
import { addUserToSessionOnSuccessAuth } from '../../../../utils/common';
import { throwError } from '../../../../utils/errorCodes';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';
import logger from '../../../../utils/logger';

export const login = async (req: Request): Promise<LoginResponse> => {
  const body: LoginRequest = req.body;
  const { username, password } = body;

  const user: UserEntity | undefined = await UserRepository.findByUsername(
    username
  );

  if (!user) {
    logger.warn(`User login unknown user ${username}`, [
      LOG_TAG.REST,
      LOG_TAG.SECURITY,
    ]);
    throw throwError(401, 'Cannot login', req);
  }

  if (!user.isEnabled) {
    logger.warn(`User login disabled user ${username}`, [
      LOG_TAG.REST,
      LOG_TAG.SECURITY,
    ]);
    throw throwError(401, 'Cannot login', req);
  }

  let isPasswordMatching = false;

  // compare hashed password
  isPasswordMatching = await bcrypt.compare(password, user.hash);

  if (!isPasswordMatching) {
    logger.warn(`User login wrong password`, [LOG_TAG.REST, LOG_TAG.SECURITY]);
    throw throwError(401, 'Cannot login', req);
  }

  if (user.isTwoFactorEnabled) {
    req.session[REDIS_PREFIX.USER_ID_KEY_2FA] = user.id;
    req.session.save();

    return {
      message: 'Login successful',
      isLogged: false,
      isTwoFactorEnabled: true,
    };
  }

  addUserToSessionOnSuccessAuth(req, user);

  return {
    message: 'Login successful',
    isLogged: true,
    isTwoFactorEnabled: false,
  };
};
