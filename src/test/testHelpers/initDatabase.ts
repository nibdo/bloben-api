import { Connection, createConnection, getConnection } from 'typeorm';

import { createORMConfig } from '../../config/ormconfig';

export const initDatabase = async () => {
  const prevConnection: Connection = await getConnection();

  if (prevConnection.isConnected) {
    await prevConnection.dropDatabase();

    await prevConnection.synchronize();

  } else {
    const connection: Connection | null = await createConnection({
      ...createORMConfig(),
      synchronize: false,
    });

    await connection.synchronize(true);
  }
};
