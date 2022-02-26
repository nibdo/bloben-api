import { Request } from 'express';

import {
  LoginRequest,
  LoginResponse,
} from '../../../bloben-interface/user/user';
import { REDIS_PREFIX, SESSION } from '../../../utils/enums';
import { throwError } from '../../../utils/errorCodes';
import UserEntity from '../../../data/entity/UserEntity';
import UserRepository from '../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';

export const login = async (req: Request): Promise<LoginResponse> => {
  const body: LoginRequest = req.body;
  const { username, password } = body;

  const user: UserEntity | undefined = await UserRepository.findByUsername(
    username
  );

  if (!user) {
    throw throwError(401, 'Cannot login', req);
  }

  if (!user.isEnabled) {
    throw throwError(401, 'Cannot login', req);
  }

  let isPasswordMatching = false;

  // compare hashed password
  isPasswordMatching = await bcrypt.compare(password, user.hash);

  if (!isPasswordMatching) {
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

  req.session[SESSION.USER_ID] = user.id;
  req.session[SESSION.ROLE] = user.role;

  req.session.save();

  return {
    message: 'Login successful',
    isLogged: true,
    isTwoFactorEnabled: false,
  };
};
