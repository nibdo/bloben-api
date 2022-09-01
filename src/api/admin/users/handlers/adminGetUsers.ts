import { GetUsersResponse } from 'bloben-interface';
import { map } from 'lodash';
import UserEntity from '../../../../data/entity/UserEntity';
import UserRepository from '../../../../data/repository/UserRepository';

export const adminGetUsers = async (): Promise<GetUsersResponse[]> => {
  const users: UserEntity[] = await UserRepository.getRepository().find();

  return map(users, (user: UserEntity) => ({
    id: user.id,
    username: user.username,
    role: user.role,
    isEnabled: user.isEnabled,
    emailsAllowed: user.emailsAllowed,
  }));
};
