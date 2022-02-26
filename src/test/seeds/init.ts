import { deletedUser } from "./2-deletedUser";
import { userSeed } from "./1-user-seed";
import { calDavCalendars } from "./3-calDavCalendars";
import { calDavEvents } from "./4-calDavEvents";
import { adminUserSeed } from "./0-adminUser-seed";

export const initSeeds = async () => {
  try {
    const admin = await new adminUserSeed().up();
    const user = await new userSeed().up();
    await new deletedUser().up();
    const { calDavAccount, calDavCalendar } = await new calDavCalendars().up();
    const { event } = await new calDavEvents().up();

    return {
      user,
      admin,
      calDavAccount,
      calDavCalendar,
      event
    };
  } catch (e) {
    console.log(e);
  }
};
