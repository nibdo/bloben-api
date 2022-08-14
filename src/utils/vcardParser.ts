import { forEach, isArray } from 'lodash';
import vCard from 'vcf';

export interface VcardParsed {
  externalID?: string;
  fullName?: string;
  emails?: string[];
}

export const parseFromVcardString = (item: string) => {
  const rawResult = new vCard().parse(item).toJSON();

  const result: VcardParsed = {};

  if (rawResult[1]) {
    forEach(rawResult[1], (item) => {
      switch (item[0]) {
        case 'uid':
          result.externalID = item[3];
          break;
        case 'fn':
          result.fullName = item[3];
          break;
        case 'email':
          if (isArray(item[3])) {
            result.emails = item[3];
          } else {
            result.emails = [item[3]];
          }
          break;
      }
    });

    return result;
  }
};

export const parseVcardToString = (
  id: string,
  email: string,
  fullName?: string
) => {
  const result = `BEGIN:VCARD\r\nVERSION:3.0\r\nPRODID:Bloben\r\nUID:${id}\r\n${
    fullName ? `FN:${fullName}\r\n` : ''
  }email:${email}\r\nREV:${new Date().toISOString()}\r\nEND:VCARD`;

  return result;
};
