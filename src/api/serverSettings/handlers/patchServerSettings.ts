import { CommonResponse } from '../../../bloben-interface/interface';
import { PatchServerSettings } from '../../../bloben-interface/serverSettings/serverSettings';
import { Request } from 'express';
import { createCommonResponse } from '../../../utils/common';
import { throwError } from '../../../utils/errorCodes';
import ServerSettingsRepository from '../../../data/repository/ServerSettingsRepository';

export const patchServerSettings = async (
  req: Request
): Promise<CommonResponse> => {
  const body: PatchServerSettings = req.body;

  const serverSettings =
    await ServerSettingsRepository.getRepository().findOne();

  if (!serverSettings) {
    throw throwError(404, 'Server settings not found');
  }

  serverSettings.checkNewVersion = body.checkNewVersion;

  await ServerSettingsRepository.getRepository().update(
    { id: serverSettings.id },
    {
      checkNewVersion: body.checkNewVersion,
    }
  );

  return createCommonResponse('Server settings updated');
};
