import { Connection, getConnection } from 'typeorm';

export const closeConnection = async () => {
  const connection: Connection = await getConnection();

  if (connection.isConnected) {
    await connection.close();
  }
};
