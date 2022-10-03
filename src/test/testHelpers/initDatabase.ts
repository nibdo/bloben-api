import { Connection, createConnection, getConnection } from 'typeorm';

import { createORMConfig } from '../../config/ormconfig';

export const dropDatabase = async () => {
  const prevConnection: Connection = await getConnection();

  if (prevConnection?.isConnected) {
    await prevConnection.dropDatabase();
  }
};

export const initDatabase = async () => {
  const prevConnection: Connection = await getConnection();

  if (prevConnection?.isConnected) {
    await prevConnection.close();
  }

  await createConnection({
    ...createORMConfig(),
    synchronize: true,
  });
};
