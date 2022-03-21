import { forEach } from 'lodash';
import dotenv from 'dotenv';

dotenv.config();

export interface Env {
  nodeEnv: string;
  appDomain: string;
  host: string;
  port: string;
  database: {
    port: string;
    host: string;
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
  redis: {
    host: string;
    port: string;
  };
  email?: {
    smtpPort: number;
    smtpHost: string;
    identity: string;
    username: string;
    password: string;
  };
  vapid?: {
    email: string;
    publicKey: string;
    privateKey: string;
  };
  encryptionPassword?: string;
}

// Import all required envs
const requiredEnvs: any = {
  NODE_ENV: process.env.NODE_ENV,
  APP_DOMAIN: process.env.APP_DOMAIN,
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_ENTITIES: process.env.DB_ENTITIES,
  DB_MIGRATIONS: process.env.DB_MIGRATIONS,
  SESSION_SECRET: process.env.SESSION_SECRET,
  // OTP_SECRET: process.env.OTP_SECRET,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD,
};

const validateRequiredEnvs = () => {
  forEach(requiredEnvs, (requiredEnv, key) => {
    if (!requiredEnv) {
      throw Error(`Missing required env: ${key}`);
    }
  });
};

export const loadEnv = (): Env => {
  // validate required env
  validateRequiredEnvs();

  return {
    nodeEnv: process.env.NODE_ENV,
    host: process.env.APP_DOMAIN,
    port: process.env.PORT,
    appDomain: process.env.APP_DOMAIN,
    encryptionPassword: process.env.ENCRYPTION_PASSWORD,
    database: {
      port: process.env.DB_PORT,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      synchronize: !!process.env.DB_SYNCHRONIZE,
      logging: !!process.env.DB_LOGGING,
      entities: process.env.DB_ENTITIES,
      migrations: process.env.DB_MIGRATIONS,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
    secret: {
      sessionSecret: process.env.SESSION_SECRET,
      otpSecret: process.env.OTP_SECRET,
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
    vapid: {
      email: process.env.VAPID_EMAIL,
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    },
    email:
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USERNAME &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_EMAIL
        ? {
            smtpHost: process.env.SMTP_HOST,
            smtpPort: Number(process.env.SMTP_PORT),
            username: process.env.SMTP_USERNAME,
            password: process.env.SMTP_PASSWORD,
            identity: process.env.SMTP_EMAIL,
          }
        : null,
  };
};
