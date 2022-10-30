import { Connection, getConnection } from 'typeorm';

import { testDemoUserData } from '../integration/seeds/user-seed';
import UserEntity from '../../data/entity/UserEntity';

export const getUserByID = async (id: string): Promise<UserEntity> => {
  const connection: Connection = await getConnection();

  return await connection.manager.findOne(UserEntity, {
    where: {
      id,
    },
  });
};

export const getTestUser = async (id: string): Promise<UserEntity> => {
  const connection: Connection = await getConnection();

  return await connection.manager.findOne(UserEntity, {
    where: {
      id,
    },
  });
};

export const getTestDemoUser = async (
  username?: string
): Promise<UserEntity> => {
  const connection: Connection = await getConnection();

  return await connection.manager.findOne(UserEntity, {
    where: {
      username: username || testDemoUserData.username,
    },
  });
};
