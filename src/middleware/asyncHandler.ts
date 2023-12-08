import { Request, Response, NextFunction, RequestHandler } from "express";
import { HttpException } from "./errorHandler.js";

const asyncHandler = (requestHandler: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requestHandler(req, res, next);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        next(error);
      }
    }
  };
};

export { asyncHandler };
