import { AdminLoginRequest } from '../../../bloben-interface/admin/admin';
import { ROLE } from '../../../bloben-interface/enums';
import { Request } from 'express';
import { env } from '../../../index';
import { throwError } from '../../../utils/errorCodes';
import UserEntity from '../../../data/entity/UserEntity';
import UserRepository from '../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginAdmin = async (req: Request): Promise<any> => {
  const body: AdminLoginRequest = req.body;
  const { username, password } = body;

  const user: UserEntity | undefined =
    await UserRepository.getRepository().findOne({
      username: username as string,
      role: ROLE.ADMIN,
    });

  if (!user) {
    throw throwError(401, 'Unauthorized', req);
  }

  const isMatchingPassword: boolean = await bcrypt.compare(password, user.hash);

  if (!isMatchingPassword) {
    throw throwError(401, 'Unauthorized', req);
  }

  // if (user.isTwoFactorEnabled) {
  //   req.session[REDIS_PREFIX.USER_ID_KEY_2FA] = user.id;
  //   req.session.save();
  //
  //   return {
  //     isLogged: false,
  //     isTwoFactorEnabled: true,
  //   };
  // }

  const jwtToken = jwt.sign(
    {
      data: {
        userID: user.id,
        role: user.role,
      },
    },
    env.secret.sessionSecret,
    { expiresIn: '1h' }
  );

  return {
    isLogged: true,
    isTwoFactorEnabled: false,
    token: jwtToken,
  };
};