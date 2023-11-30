import { Types } from "mongoose";
import { User } from "../models/index.js";
import { User as UserType } from "../models/schemas/user.js";

const userService = {
  async getUser({ id }: { id: Types.ObjectId }) {
    const users = await User.findById(id).exec();

    return users;
  },

  async getUserRecommend() {
    // TODO: 추천 유저 쿼리 만들기
    const users = await User.find({}).limit(5);

    return users;
  },

  async getUserMain() {
    const user = await User.findOne({ _id: "65654d023948df4dfd0cf108" });
    return user;
  },

  async UpdateMe(data: UserType) {
    try {
      await User.updateOne({ _id: "65654d023948df4dfd0cf108" }, data);
    } catch (error) {
      throw new Error("Update failed.");
    }
  },
};

export default userService;
