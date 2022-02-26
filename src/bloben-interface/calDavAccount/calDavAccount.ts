export interface CreateCalDavAccountRequest {
  username: string;
  password: string;
  url: string;
}

export interface UpdateCalDavAccountRequest {
  password: string;
}

export interface GetCalDavAccountResponse {
  id: string;
  username: string;
  password: string;
  url: string;
  principalUrl: string;
}
