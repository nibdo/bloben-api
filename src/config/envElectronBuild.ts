import dotenv from 'dotenv';

dotenv.config();

export interface Env {
  nodeEnv: string;
  isElectron?: boolean;
  appDomain: string;
  host: string;
  port: string;
  database: {
    port: string;
    host: string;
    type: string;
    username: string;
    password: string;
    database: string;
    synchronize?: boolean;
    logging?: boolean;
    entities: string;
    migrations: string;
  };
  secret: {
    sessionSecret: string;
    otpSecret: string;
  };
  redis?: {
    host?: string;
    port?: string;
    url?: string;
  };
  email?: {
    smtpPort: number;
    smtpHost: string;
    identity: string;
    username: string;
    password: string;
  };
  encryptionPassword?: string;
}

export const loadEnv = (): Env => {
  return {
    nodeEnv: process.env.NODE_ENV || 'production',
    isElectron: true,
    host: 'localhost',
    port: '7010',
    appDomain: process.env.APP_DOMAIN,
    encryptionPassword: 'root',
    database: {
      port: undefined,
      host: undefined,
      username: undefined,
      password: undefined,
      type: 'sqlite',
      database: process.env.SNAP_USER_DATA
        ? `${process.env.SNAP_USER_DATA}/data.sqlite`
        : './data.sqlite',
      synchronize: false,
      logging: false,
      entities: __dirname + '/../data/entity/*.js',
      migrations: __dirname + '/../data/migrations/*.js',
    },
    secret: {
      sessionSecret: process.env.SESSION_SECRET || 'root',
      otpSecret: process.env.OTP_SECRET || '',
    },
    redis: undefined,
    email: null,
  };
};

export const isElectron = true;
