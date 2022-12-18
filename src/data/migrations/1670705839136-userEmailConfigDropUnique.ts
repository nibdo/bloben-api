import { MigrationInterface, QueryRunner } from 'typeorm';

export class userEmailConfigDropUnique1670705839136
  implements MigrationInterface
{
  name = 'userEmailConfigDropUnique1670705839136';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user_email_config');

    if (table?.columns?.length) {
      const column = table.columns.find((item) => item.name === 'user_id');
      const uniqueKeys = table.findColumnUniques(column);

      if (uniqueKeys?.length) {
        await queryRunner.dropUniqueConstraint(
          'user_email_config',
          uniqueKeys[0].name
        );
      }
    }
  }

  public async down(): Promise<void> {
    return;
  }
}
