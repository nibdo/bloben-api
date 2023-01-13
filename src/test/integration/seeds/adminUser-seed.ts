import { Connection, getConnection } from 'typeorm';

import { ROLE } from '../../../data/types/enums';
import { USER_ROLE } from '../../../api/app/auth/UserEnums';
import { generateRandomSimpleString } from '../../../utils/common';
import { v4 } from 'uuid';
import UserEntity from '../../../data/entity/UserEntity';
import UserRepository from '../../../data/repository/UserRepository';
import bcrypt from 'bcryptjs';

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
  await connection.query(`INSERT INTO users 
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

  return {
    id: adminID,
    username,
  };
};
