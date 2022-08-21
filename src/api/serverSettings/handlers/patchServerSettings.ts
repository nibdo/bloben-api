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

  const serverSettingsAll =
    await ServerSettingsRepository.getRepository().find();
  const serverSettings = serverSettingsAll?.[0];

  if (!serverSettings) {
    throw throwError(404, 'Server settings not found');
  }

  await ServerSettingsRepository.getRepository().update(
    { id: serverSettings.id },
    body
  );

  return createCommonResponse('Server settings updated');
};
