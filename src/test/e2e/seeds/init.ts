import {userCalDavSeed, userOnlyCalDavSeed} from './1-user-caldav-seed';

export const initSeeds = async () => {
  try {
    const { user, calDavAccount } = await new userCalDavSeed().up();

    return {
      user,
      calDavAccount,
    };
  } catch (e) {
    console.log(e);
  }
};


export const initUserOnlySeeds = async () => {
  try {
    const { user } = await new userOnlyCalDavSeed().up();

    return {
      user,
    };
  } catch (e) {
    console.log(e);
  }
};
