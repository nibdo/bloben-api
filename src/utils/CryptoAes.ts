// @ts-ignore
import CryptoJS from 'crypto-js';

import { env } from '../index';

//
//Encrypt and decrypt with Crypto
//
const encryptData = (dataForEncryption: object) =>
  CryptoJS.AES.encrypt(
    JSON.stringify(dataForEncryption),
    env.dbEncryptionPassword
  ).toString();
const encryptStringData = (dataForEncryption: string) =>
  CryptoJS.AES.encrypt(dataForEncryption, env.dbEncryptionPassword).toString();
export const CryptoAes = {
  encrypt: (dataForEncryption: object): Promise<string> =>
    new Promise((resolve, reject) => {
      if (!env.dbEncryptionPassword || env.dbEncryptionPassword.length === 0) {
        reject('Missing password');
      }

      if (!dataForEncryption) {
        reject('Missing data');
      }

      resolve(encryptData(dataForEncryption));
    }),
  encryptString: (stringData: string): Promise<string> =>
    new Promise((resolve, reject) => {
      if (!env.dbEncryptionPassword || env.dbEncryptionPassword.length === 0) {
        reject('Missing password');
      }

      if (
        !stringData ||
        typeof stringData !== 'string' ||
        stringData.length === 0
      ) {
        reject('Invalid string data');
      }

      resolve(encryptStringData(stringData));
    }),
  decrypt(encryptedData: string): Promise<object> {
    return new Promise((resolve, reject) => {
      if (!env.dbEncryptionPassword || env.dbEncryptionPassword.length === 0) {
        reject('Missing password');
      }

      if (
        !encryptedData ||
        typeof encryptedData !== 'string' ||
        encryptedData.length === 0
      ) {
        reject('Invalid string data');
      }

      // Decrypt data with Crypto
      const bytes = CryptoJS.AES.decrypt(
        encryptedData,
        env.dbEncryptionPassword
      );
      const originalText: string = bytes.toString(CryptoJS.enc.Utf8);
      const jsonObj: object = JSON.parse(originalText);
      if (jsonObj) {
        resolve(jsonObj);
      } else {
        reject();
      }
    });
  },
  decryptString(encryptedData: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Decrypt data with Crypto
      const bytes = CryptoJS.AES.decrypt(
        encryptedData,
        env.dbEncryptionPassword
      );
      const originalText: string = bytes.toString(CryptoJS.enc.Utf8);
      if (originalText) {
        resolve(originalText);
      } else {
        reject();
      }
    });
  },
};
