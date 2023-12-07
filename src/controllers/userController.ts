import { Request, Response } from "express";
import userService from "../services/userService.js";
import { Types } from "mongoose";

interface RequestHasBody<T> extends Request {
  body: T;
}

const userController = {
  async getUser(req: Request<{ id?: Types.ObjectId }>, res: Response) {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "undefined id" });
      // TODO: 에러 핸들링
      return;
    }

    const user = await userService.getUser({ id });
    res.status(200).json(user);
  },

  async getUserRecommend(_: any, res: Response) {
    const loginUserId = res.locals.userInfo._id;
    const users = await userService.getUserRecommend(loginUserId);
    res.status(200).json(users);
  },

  async updateConditionExpect(req: Request, res: Response) {
    const conditionExpect = req.body;
    const loginUserId = res.locals.userInfo._id;
    await userService.updateConditionExpect(conditionExpect, loginUserId);

    res.status(200).end();
  },

  async getUserMine(req: Request, res: Response) {
    const loginUserId = res.locals.userInfo._id;
    const user = await userService.getUserMain(loginUserId);

    res.status(200).json(user);
  },

  async updateMe(req: Request, res: Response) {
    const user = req.body;
    const loginUserId = res.locals.userInfo._id;
    await userService.UpdateMe(user, loginUserId);

    res.status(200).end();
  },

  async registerWebPushToken(
    req: RequestHasBody<{ token: string }>,
    res: Response,
  ) {
    try {
      const { token } = req.body;
      const user = res.locals.userInfo;
      await userService.registerWebPushToken({ userId: user._id, token });
      res.status(201).end();
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json(err.message);
      }
    }
  },
};

export default userController;
