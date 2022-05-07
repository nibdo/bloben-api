import {
  Connection,
  getConnection,
  MigrationInterface,
} from 'typeorm';

import bcrypt from "bcrypt";
import {USER_ROLE} from "../../../api/user/UserEnums";
import {
  DEFAULT_ADMIN_PASSWORD
} from "../../../data/migrations/1630862365000-admin";
import {v4} from 'uuid'

export class adminUserSeed implements MigrationInterface {
  public async up(): Promise<{id: string}> {
    const saltRounds = 10;
    const salt = await bcrypt.genSaltSync(saltRounds);
    const hash = await bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, salt);

    const connection: Connection = await getConnection();

    const adminID = v4()

    await connection.query(`INSERT INTO public.users 
(id, username, hash, role)
VALUES ('${adminID}', 'admin', '${hash}', '${USER_ROLE.ADMIN}');`);

    return {
      id: adminID
    }
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
