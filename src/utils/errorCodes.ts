import { Request } from 'express';

export const errorParser: any = (error: any): string => JSON.stringify(error);

export const throwError: any = (
  code: number,
  message: string,
  req?: Request
) => {
  if (req) {
    return {
      code,
      message,
      path: req.originalUrl,
      method: req.method,
      appError: true,
    };
  } else {
    return {
      code,
      message,
      path: null,
      method: null,
      appError: true,
    };
  }
};
