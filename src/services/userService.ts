import { Types } from "mongoose";
import { User } from "../models/index.js";

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
};

export default userService;
