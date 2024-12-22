export enum RStatus {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
}

export interface R<T = any> {
  data?: T;
  message?: string | string[] | any;
  error?: string;
  status: RStatus;
}
