import { Entity, PrimaryColumn } from 'typeorm';

@Entity('timezones')
export default class TimezoneEntity {
  @PrimaryColumn()
  name: string;

  constructor(timezone: string) {
    if (timezone) {
      this.name = timezone;
    }
  }
}
