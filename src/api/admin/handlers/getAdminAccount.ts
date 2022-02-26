import { GetAdminAccountResponse } from '../../../bloben-interface/admin/admin';
import { ROLE } from '../../../bloben-interface/enums';
import { Request, Response } from 'express';

export const getAdminAccount = async (
  req: Request,
  res: Response
): Promise<GetAdminAccountResponse> => {
  const { user } = res.locals;

  if (!user || user.role !== ROLE.ADMIN) {
    return {
      isLogged: false,
      role: null,
    };
  }

  return {
    isLogged: true,
    role: user.role,
  };
};
