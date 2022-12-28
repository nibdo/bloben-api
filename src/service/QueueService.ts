import { BULL_QUEUE } from '../utils/enums';
import {
  calDavSyncBullQueue,
  cardDavBullQueue,
  emailInviteBullQueue,
  sendEmailBullQueue,
  webcalRemindersBullQueue,
  webcalSyncBullQueue,
} from './BullQueue';
import { calculateWebcalAlarms } from '../jobs/queueJobs/calculateWebcalAlarmsJob';
import { processEmailEventJob } from '../jobs/queueJobs/processEmailEventJob';
import { sendEmailQueueJob } from '../jobs/queueJobs/sendEmailQueueJob';
import { syncCalDavQueueJob } from '../jobs/queueJobs/syncCalDavQueueJob';
import { syncCardDavQueueJob } from '../jobs/queueJobs/syncCardDavQueueJob';
import { syncWebcalEventsQueueJob } from '../jobs/queueJobs/syncWebcalEventsQueueJob';

export class QueueService {
  protected isElectron: boolean;

  constructor(isElectron?: boolean) {
    this.isElectron = isElectron;
  }

  public async syncCalDav(userID: string) {
    if (this.isElectron) {
      await syncCalDavQueueJob({ data: { userID } } as any);
    } else {
      await calDavSyncBullQueue.add(BULL_QUEUE.CALDAV_SYNC, {
        userID,
      });
    }
  }

  public async syncCardDav(userID: string) {
    if (this.isElectron) {
      await syncCardDavQueueJob({ data: { userID } } as any);
    } else {
      await cardDavBullQueue.add(BULL_QUEUE.CARDDAV_SYNC, { userID });
    }
  }

  public async sendEmailQueue(data: any) {
    if (this.isElectron) {
      await sendEmailQueueJob({ data } as any);
    } else {
      await sendEmailBullQueue.add(BULL_QUEUE.EMAIL, data);
    }
  }

  public async processEmails(data: any) {
    if (this.isElectron) {
      await processEmailEventJob({ data } as any);
    } else {
      await emailInviteBullQueue.add(BULL_QUEUE.EMAIL, data);
    }
  }

  public async syncWebcal(userID: string) {
    if (this.isElectron) {
      await syncWebcalEventsQueueJob({ data: { userID } } as any);
    } else {
      await webcalSyncBullQueue.add(BULL_QUEUE.WEBCAL_SYNC, { userID });
    }
  }

  public async webcalReminders(id: string) {
    if (this.isElectron) {
      await calculateWebcalAlarms({ data: { webcalCalendarID: id } } as any);
    } else {
      await webcalRemindersBullQueue.add(BULL_QUEUE.WEBCAL_REMINDER, {
        webcalCalendarID: id,
      });
    }
  }
}
