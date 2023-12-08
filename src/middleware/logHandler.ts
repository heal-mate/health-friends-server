import { NextFunction, Request, Response } from "express";
import { HttpException } from "./errorHandler";

function logHandler(
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(`[${new Date()}]` + err);
  next(err);
}

export default logHandler;
