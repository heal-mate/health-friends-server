import { Request, Response, NextFunction, RequestHandler } from "express";

const asyncHandler = (requestHandler: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      requestHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export { asyncHandler };
