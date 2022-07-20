import { deletedUser } from './2-deletedUser';
import { userSeed } from './1-user-seed';
import { calDavCalendars } from './3-calDavCalendars';
import { calDavEvents } from './4-calDavEvents';
import { adminUserSeed } from './0-adminUser-seed';
import { webcal } from './6-webcal';
import { calDavTasks } from './7-calDavTasks';
import { calDavTaskSettings } from './8-calDavTaskSettings';
import { userEmailConfig } from './9-userEmailConfig';
import { sharedCalendar } from './10-sharedCalendar';

export const initSeeds = async () => {
  try {
    const admin = await new adminUserSeed().up();
    const user = await new userSeed().up();
    await new deletedUser().up();
    const { calDavAccount, calDavCalendar } = await new calDavCalendars().up();
    const { event, repeatedEvent } = await new calDavEvents().up();
    const { webcalCalendar } = await new webcal().up();
    const { task } = await new calDavTasks().up();
    const { taskSettings } = await new calDavTaskSettings().up();
    await new userEmailConfig().up();
    const { sharedLink, sharedLinkDisabled, sharedLinkExpired } =
      await new sharedCalendar().up();

    return {
      user,
      admin,
      calDavAccount,
      calDavCalendar,
      event,
      repeatedEvent,
      task,
      taskSettings,
      webcalCalendar,
      sharedLink,
      sharedLinkDisabled,
      sharedLinkExpired,
    };
  } catch (e) {
    console.log(e);
  }
};

export const initUserSeed = async () => {
  await new userSeed().up();
};
