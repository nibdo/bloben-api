import { MigrationInterface, QueryRunner } from 'typeorm';
import UserRepository from '../repository/UserRepository';

export class CreateCalendarSettings1649503032000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const usersWithoutSettings: { id: string }[] =
      await UserRepository.getRepository().query(`
      SELECT
        u.id as id
      FROM 
        users u
      LEFT JOIN calendar_settings c ON u.id = c.user_id
      WHERE
        c.user_id IS NULL
    `);

    for (const user of usersWithoutSettings) {
      await queryRunner.query(
        `INSERT INTO public.calendar_settings (user_id) VALUES ('${user.id}')`
      );
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
