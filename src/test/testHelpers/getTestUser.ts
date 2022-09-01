import { Connection, getConnection } from 'typeorm';

import { ROLE } from '../../data/types/enums';
import { testDemoUserData } from '../integration/seeds/1-user-seed';
import UserEntity from '../../data/entity/UserEntity';
import UserRepository from '../../data/repository/UserRepository';
import jwt from 'jsonwebtoken';

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

export const createWrongAdminToken = async () => {
  const user = await UserRepository.getRepository().findOne({
    where: {
      role: ROLE.USER,
    },
  });

  return jwt.sign(
    {
      data: {
        userID: user.id,
        role: user.role,
      },
    },
    'pass',
    { expiresIn: '1h' }
  );
};
