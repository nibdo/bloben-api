import { BLOBEN_EVENT_KEY, MSG_STATUS } from '../../utils/enums';
import { EventSyncAction } from 'bloben-interface';

export interface UserSocketData {
  clientSessionId: SocketSession;
}

export interface SocketSession {
  userID: string;
  createdAt: string;
}

export interface SyncResponse {
  syncedAt: string;
  data: EventSyncAction[];
}

export interface SyncLocalItemsResponse {
  id: string;
  status: MSG_STATUS;
}

export interface EmailCredentials {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
  secure?: boolean;
}

export interface SmtpAuth {
  user: string;
  pass: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: SmtpAuth;
}

export interface EmailData {
  messageId?: string;
  from: string;
  recipient: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: any;
  headers?: any;
}

export interface EventProps {
  [BLOBEN_EVENT_KEY.INVITE_FROM]: string | undefined;
  [BLOBEN_EVENT_KEY.INVITE_TO]: string | undefined;
}
