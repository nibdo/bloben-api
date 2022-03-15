import { ImportMock } from 'ts-mock-imports';
const nodemailer = require('nodemailer');

export const mockNodemailer = () => {
  const mockManager = ImportMock.mockFunction(nodemailer, 'createTransport', {
    sendMail: (data: any) => {
      return Promise.resolve();
    },
    verify: () => {
      return Promise.resolve(true);
    },
    close: () => {
      return;
    },
  });

  return mockManager;
};
