import { GetVersion } from '../../../bloben-interface/version/version';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageFile: any = require('../../../../package.json');

export const getVersion = async (): Promise<GetVersion> => {
  return {
    version: packageFile.version,
  };
};
