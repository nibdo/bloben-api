// eslint-disable-next-line unused-imports/no-unused-imports-ts,@typescript-eslint/no-unused-vars
import { io } from '../../app';

export const mockSocketio = () => {
  // @ts-ignore
  // eslint-disable-next-line unused-imports/no-unused-imports-ts,@typescript-eslint/no-unused-vars
  io = {
    to: () => {
      return {
        emit: () => {
          return;
        },
      };
    },
  };
};
