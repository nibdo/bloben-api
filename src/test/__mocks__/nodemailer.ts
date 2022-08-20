import { ImportMock } from 'ts-mock-imports';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemailer = require('nodemailer');

export const mockNodemailer = () => {
  ImportMock.restore();

  const mockManager = ImportMock.mockFunction(nodemailer, 'createTransport', {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
