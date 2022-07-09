import { EntityRepository, Repository, getRepository } from 'typeorm';

import { getOneResult } from '../../utils/common';
import SharedLinkEntity from '../entity/SharedLink';

@EntityRepository(SharedLinkEntity)
export default class SharedLinkRepository extends Repository<SharedLinkEntity> {
  public static getRepository() {
    return getRepository(SharedLinkEntity);
  }

  public static getSharedLinkByID = async (
    id: string,
    userID: string
  ): Promise<{
    id: string;
    isEnabled: boolean;
    expireAt: Date;
  }> => {
    const sharedLinkRaw = await SharedLinkRepository.getRepository().query(
      `
    SELECT
      s.id as id,
      s.is_enabled as "isEnabled",
      s.expire_at as "expireAt"
    FROM
        shared_links s
    WHERE
        s.user_id = $1
        AND s.id = $2
        AND s.deleted_at IS NULL
  `,
      [userID, id]
    );

    if (!sharedLinkRaw.length) {
      return null;
    }

    return getOneResult(sharedLinkRaw);
  };

  public static getCalDavSharedCalendars = async (id: string) => {
    const caldavIDs: { id: string }[] =
      await SharedLinkRepository.getRepository().query(
        `
    SELECT
      c.id as id
    FROM
        shared_links s
    INNER JOIN shared_link_calendars slc ON slc.shared_link_id = s.id
    INNER JOIN caldav_calendars c ON c.id = slc.caldav_calendar_id
    WHERE
        s.id = $1
        AND s.deleted_at IS NULL
        AND c.deleted_at IS NULL
  `,
        [id]
      );

    return caldavIDs;
  };

  public static getWebcalSharedCalendars = async (id: string) => {
    const ids: { id: string }[] =
      await SharedLinkRepository.getRepository().query(
        `
    SELECT
      wc.id as id
    FROM
        shared_links s
    INNER JOIN shared_link_calendars slc ON slc.shared_link_id = s.id
    INNER JOIN webcal_calendars wc ON wc.id = slc.webcal_calendar_id
    WHERE
        s.id = $1
        AND s.deleted_at IS NULL
        AND wc.deleted_at IS NULL
  `,
        [id]
      );

    return ids;
  };
}
