import { Request, Response } from "express";
import userService from "../services/userService.js";
import { Types } from "mongoose";

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
    const users = await userService.getUserRecommend();
    res.status(200).json(users);
  },

  async updateConditionExpect(req: Request, res: Response) {
    const conditionExpect = req.body;

    await userService.updateConditionExpect(conditionExpect);

    res.status(200).end();
  },
};

export default userController;
