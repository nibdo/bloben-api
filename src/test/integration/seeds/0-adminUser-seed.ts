import { Connection, getConnection } from 'typeorm';

import { ROLE } from '../../../bloben-interface/enums';
import { USER_ROLE } from '../../../api/app/auth/UserEnums';
import { env } from '../../../index';
import { generateRandomSimpleString } from '../../../utils/common';
import { v4 } from 'uuid';
import UserEntity from '../../../data/entity/UserEntity';
import UserRepository from '../../../data/repository/UserRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const seedAdminUser = async (
  data?: any
): Promise<{
  id: string;
  username: string;
  jwtToken: string;
}> => {
  const saltRounds = 10;
  const salt = await bcrypt.genSaltSync(saltRounds);
  const hash = await bcrypt.hashSync(process.env.INITIAL_ADMIN_PASSWORD, salt);

  const connection: Connection = await getConnection();

  const adminID = v4();

  const username = generateRandomSimpleString(20);
  await connection.query(`INSERT INTO public.users 
(id, username, hash, role)
VALUES ('${adminID}', '${generateRandomSimpleString(20)}', '${hash}', '${
    USER_ROLE.ADMIN
  }');`);

  const admin = new UserEntity(null);
  admin.username = username;
  admin.role = ROLE.ADMIN;
  admin.hash = hash;
  admin.id = adminID;
  admin.isEnabled = true;

  if (data?.isTwoFactorEnabled) {
    admin.isTwoFactorEnabled = data.isTwoFactorEnabled;
  }
  if (data?.twoFactorSecret) {
    admin.twoFactorSecret = data.twoFactorSecret;
  }

  await UserRepository.getRepository().save(admin);

  const jwtToken = jwt.sign(
    {
      data: {
        userID: admin.id,
        role: admin.role,
      },
    },
    env.secret.sessionSecret,
    { expiresIn: '1h' }
  );

  return {
    id: adminID,
    username,
    jwtToken,
  };
};
