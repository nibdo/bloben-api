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
import { carddavAddressBooks } from './11-cardDavAddressBooks';
import { cardDavContacts } from './12-cardDavContacts';

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
    const { cardDavAccount, cardDavAddressBook } =
      await new carddavAddressBooks().up();
    const { contact } = await new cardDavContacts().up();

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
      cardDavAccount,
      cardDavAddressBook,
      contact,
    };
  } catch (e) {
    console.log(e);
  }
};

export const initUserSeed = async () => {
  await new userSeed().up();
};
