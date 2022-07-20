import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import CalDavCalendarEntity from './CalDavCalendar';
import SharedLinkEntity from './SharedLink';
import WebcalCalendarEntity from './WebcalCalendarEntity';

@Entity('shared_link_calendars')
export default class SharedLinkCalendarEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'shared_link_id' })
  sharedLinkID: string;
  @ManyToOne(
    () => SharedLinkEntity,
    (sharedLink) => sharedLink.sharedLinkCalendars,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'shared_link_id', referencedColumnName: 'id' })
  sharedLink: SharedLinkEntity;

  @ManyToOne(
    () => CalDavCalendarEntity,
    (calendar) => calendar.sharedLinkCalendar,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'caldav_calendar_id', referencedColumnName: 'id' })
  calDavCalendar: CalDavCalendarEntity;

  @ManyToOne(
    () => WebcalCalendarEntity,
    (calendar) => calendar.sharedLinkCalendar,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'webcal_calendar_id', referencedColumnName: 'id' })
  webcalCalendar: WebcalCalendarEntity;

  constructor(sharedLink: SharedLinkEntity, id?: string) {
    if (sharedLink) {
      this.sharedLink = sharedLink;
    }

    if (id) {
      this.sharedLinkID = id;
    }
  }
}
