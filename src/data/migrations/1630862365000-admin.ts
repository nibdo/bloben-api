import { MigrationInterface, QueryRunner } from 'typeorm';
import { USER_ROLE } from '../../api/app/auth/UserEnums';
import { isElectron } from '../../config/env';
import { v4 } from 'uuid';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

export const DEFAULT_ADMIN_PASSWORD =
  process.env.INITIAL_ADMIN_PASSWORD || 'root';

export class Admin16308623652000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (isElectron) {
      return;
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSaltSync(saltRounds);
    const hash = await bcrypt.hashSync(
      process.env.INITIAL_ADMIN_PASSWORD || 'root',
      salt
    );

    await queryRunner.query(`INSERT INTO users 
(id, username, hash, role)
VALUES ('${v4()}', 'admin', '${hash}', '${USER_ROLE.ADMIN}');`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM users WHERE username = 'admin'`);
  }
}
