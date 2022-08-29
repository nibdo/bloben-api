import { GetAdminAccountResponse } from '../../../bloben-interface/admin/admin';
import { ROLE } from '../../../bloben-interface/enums';
import { Request, Response } from 'express';
import UserEntity from '../../../data/entity/UserEntity';
import UserRepository from '../../../data/repository/UserRepository';

export const getAdminAccount = async (
  req: Request,
  res: Response
): Promise<GetAdminAccountResponse> => {
  const { userID } = res.locals;

  const user: UserEntity | undefined = await UserRepository.findAdminById(
    userID
  );

  if (!user || user.role !== ROLE.ADMIN) {
    return {
      username: null,
      isLogged: false,
      role: null,
      isTwoFactorEnabled: false,
    };
  }

  return {
    username: user.username,
    isLogged: true,
    role: user.role,
    isTwoFactorEnabled: user.isTwoFactorEnabled,
  };
};
