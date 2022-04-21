import { MigrationInterface } from 'typeorm';
import WebcalCalendarRepository from '../repository/WebcalCalendarRepository';

export class UpdateWebcalExceptionDate1660503032000
  implements MigrationInterface
{
  public async up(): Promise<void> {
    await WebcalCalendarRepository.getRepository().query(`
      UPDATE 
        webcal_calendars
      SET 
        attempt = 0, last_sync_at = NULL
    `);
  }

  public async down(): Promise<void> {
    return;
  }
}
