import { Request, Response } from 'express';

import { LoginDemoRequest } from 'bloben-interface';
import { ROLE } from '../../../../data/types/enums';
import { SESSION } from '../../../../utils/enums';
import { throwError } from '../../../../utils/errorCodes';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';
import bcrypt from 'bcryptjs';

export const loginDemo = async (req: Request, res: Response): Promise<void> => {
  const { username, password, redirect } =
    req.query as unknown as LoginDemoRequest;

  const user: UserEntity | undefined = await UserRepository.findByUsername(
    username
  );

  if (!user) {
    throw throwError(401, 'Cannot login', req);
  }

  if (user.role !== ROLE.DEMO) {
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

  req.session[SESSION.USER_ID] = user.id;
  req.session[SESSION.ROLE] = user.role;

  req.session.save();

  return res.redirect(redirect);
};
