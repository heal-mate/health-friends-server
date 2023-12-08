import { Request, Response } from "express";
import userService from "../services/userService.js";
import { Types } from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpException } from "../middleware/errorHandler.js";

interface RequestHasBody<T> extends Request {
  body: T;
}

const userController = {
  getUser: asyncHandler(
    async (req: Request<{ id?: Types.ObjectId }>, res: Response) => {
      const { id } = req.params;

      if (!id) {
        throw new HttpException(400, "undefined id");
      }

      const user = await userService.getUser({ id });
      res.status(200).json(user);
    },
  ),

  getUserRecommend: asyncHandler(async (_: any, res: Response) => {
    const loginUserId = res.locals.userInfo._id;
    const users = await userService.getUserRecommend(loginUserId);
    res.status(200).json(users);
  }),

  updateConditionExpect: asyncHandler(async (req: Request, res: Response) => {
    const conditionExpect = req.body;
    const loginUserId = res.locals.userInfo._id;
    await userService.updateConditionExpect(conditionExpect, loginUserId);

    res.status(200).end();
  }),

  getUserMine: asyncHandler(async (req: Request, res: Response) => {
    const loginUserId = res.locals.userInfo._id;
    const user = await userService.getUserMain(loginUserId);

    res.status(200).json(user);
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const user = req.body;
    const loginUserId = res.locals.userInfo._id;
    await userService.UpdateMe(user, loginUserId);

    res.status(200).end();
  }),

  registerWebPushToken: asyncHandler(
    async (req: RequestHasBody<{ token: string }>, res: Response) => {
      const { token } = req.body;
      const user = res.locals.userInfo;
      await userService.registerWebPushToken({ userId: user._id, token });
      res.status(201).end();
    },
  ),

  // 유효한 유저인지 확인
  isValidUser: asyncHandler(async (req: Request, res: Response) => {
    const loginUserInfo = res.locals.userInfo;
    res.status(400).json(loginUserInfo);
  }),
};

export default userController;
