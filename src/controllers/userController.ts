import { Response } from "express";
import userService from "../services/userService.js";

const userController = {
  async getUsers(_: any, res: Response) {
    const users = await userService.getUsers();
    res.status(200).json(users);
  },
};

export default userController;
