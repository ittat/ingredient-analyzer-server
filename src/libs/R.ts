
export enum RStatus {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
}

export class R<T = any> {
  data?: T;
  message?: string | string[] | any;
  error?: string;
  status: RStatus;
  constructor(status: number, data?: T, message?: string) {
    this.data = data;
    this.message = message;
    this.status = status;
  }

  static ok<T>(data?: T) {
    return new R<T>(RStatus.OK, data);
  }

  static error(status: RStatus, error?: string, message?: any) {
    return new R(status, message, error);
  }
}
