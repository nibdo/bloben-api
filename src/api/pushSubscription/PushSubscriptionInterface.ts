export interface CreatePushSubscriptionRequest {
  subscription: SubscriptionData;
}

export interface SubscriptionData {
  keys: KeysData;
  endpoint: string;
}

export interface KeysData {
  auth: string;
  p256dh: string;
}
