import { Connection, MigrationInterface, getConnection } from 'typeorm';

import { TEST_USER_PASSWORD } from './1-user-seed';
import UserEntity from '../../../data/entity/UserEntity';
import {AdminCreateUserRequest} from "../../../bloben-interface/admin/admin";
import AdminUsersService from "../../../api/adminUsers/AdminUsersService";

const userData: AdminCreateUserRequest = {
  username: 'deleted_user',
  password: TEST_USER_PASSWORD,
};

export class deletedUser implements MigrationInterface {
  public async up(): Promise<void> {
    // @ts-ignore
    await AdminUsersService.adminCreateUser({ body: userData, session: {} });
    const connection: Connection = await getConnection();

    const user: UserEntity | undefined = await connection.manager.findOne(
      UserEntity,
      {
        where: {
          username: userData.username
        }
      }
    );

    user.deletedAt = new Date();

    await connection.manager.save(user);
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
