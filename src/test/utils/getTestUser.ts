import { Connection, getConnection } from 'typeorm';

import {testDemoUserData, testUserData} from '../seeds/1-user-seed';
import UserEntity from '../../data/entity/UserEntity';
import {env} from "../../index";
import jwt from 'jsonwebtoken';

export const getUserByID = async (id: string): Promise<UserEntity> => {
    const connection: Connection = await getConnection();

    return await connection.manager.findOne(UserEntity, {
        where: {
            id,
        },
    });
};

export const getTestUser = async (): Promise<UserEntity> => {
  const connection: Connection = await getConnection();

  return await connection.manager.findOne(UserEntity, {
    where: {
      username: testUserData.username,
    },
  });
};

export const getTestDemoUser = async (): Promise<UserEntity> => {
    const connection: Connection = await getConnection();

    return await connection.manager.findOne(UserEntity, {
        where: {
            username: testDemoUserData.username,
        },
    });
};

export const getTestAdmin = async (): Promise<UserEntity> => {
  const connection: Connection = await getConnection();

  return await connection.manager.findOne(UserEntity, {
    where: {
      username: 'admin',
    },
  });
};

export const createAdminToken = async () => {
  const testUser: UserEntity = await getTestAdmin();

  return jwt.sign(
      {
        data: {
          userID: testUser.id,
          role: testUser.role,
        },
      },
      env.secret.sessionSecret,
      { expiresIn: '1h' }
  );
}
export const createWrongAdminToken = async () => {
  const testUser: UserEntity = await getTestAdmin();

  return jwt.sign(
      {
        data: {
          userID: testUser.id,
          role: testUser.role,
        },
      },
      'pass',
      { expiresIn: '1h' }
  );
}
