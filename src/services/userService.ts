import { Types } from "mongoose";
import { User } from "../models/index.js";
import { Condition } from "../models/schemas/user.js";
import { ObjectId } from "mongodb";

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

  async updateConditionExpect(conditionExpect: Condition<"RANGE">) {
    await User.updateOne(
      { _id: "65654d023948df4dfd0cf108" },
      { conditionExpect },
    );
  },
};

export default userService;
