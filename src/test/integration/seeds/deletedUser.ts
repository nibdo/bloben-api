import { Connection, getConnection } from 'typeorm';

import { AdminCreateUserRequest } from 'bloben-interface';
import { TEST_USER_PASSWORD } from './user-seed';
import AdminUsersService from '../../../api/admin/users/AdminUsersService';
import UserEntity from '../../../data/entity/UserEntity';

const userData: AdminCreateUserRequest = {
  username: 'deleted_user',
  password: TEST_USER_PASSWORD,
};

export const deletedUser = async () => {
  // @ts-ignore
  await AdminUsersService.adminCreateUser({ body: userData, session: {} });
  const connection: Connection = await getConnection();

  const user: UserEntity | undefined = await connection.manager.findOne(
    UserEntity,
    {
      where: {
        username: userData.username,
      },
    }
  );

  user.deletedAt = new Date();

  await connection.manager.save(user);
};
