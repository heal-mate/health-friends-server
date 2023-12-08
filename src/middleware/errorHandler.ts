import { NextFunction, Request, Response } from "express";

export class HttpException extends Error {
  status: number;
  message: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

function errorHandler(
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return res.status(err.status || 500).json({
    result: "fail",
    error: err.message || "Error",
  });
}

export default errorHandler;
