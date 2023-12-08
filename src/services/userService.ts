import { Types } from "mongoose";
import { User } from "../models/index.js";
import { User as UserType } from "../models/schemas/user.js";
import { Condition } from "../models/schemas/user.js";
import { getMessaging } from "firebase-admin/messaging";
import { HttpException } from "../middleware/errorHandler.js";
import {
  makeRecommendUserFilterCallback,
  makeRecommendUserQuery,
} from "../utils/documentQueryFn.js";

const userService = {
  async getUser({ id }: { id: Types.ObjectId }) {
    const user = await User.findById(id).exec();

    return user;
  },

  /**
   * 나의 conditionExpect와 유저들의 condition을 비교하는 AND 쿼리로 얻은 usersRecommended를
   * 나의 condition과 유저들의 conditionExpect를 비교해 걸러주는 filter 메서드를 사용해 추천 유저 획득
   * */
  async getUserRecommend(loginUserId: string) {
    // recommend를 요청한 user의 정보
    const userRequested = await User.findById(loginUserId).lean();
    if (!userRequested) return;

    const {
      condition: myCondition,
      conditionExpect: myConditionExpect,
      matchExceptUserIds,
    } = userRequested;

    // 나의 conditionExpect와 유저들의 condition을 비교하는 AND 쿼리 생성
    const queries = makeRecommendUserQuery({
      myConditionExpect,
      matchExceptUserIds,
      loginUserId,
    });

    const usersRecommended = await User.find({ $and: queries }).lean();
    if (!usersRecommended) return [];

    return (
      usersRecommended
        // 나의 condition과 추천된 유저들의 conditionExpect를 비교, 필터링
        .filter(makeRecommendUserFilterCallback(myCondition))
        .slice(0, 5)
    );
  },

  async getUserMain(loginUserId: string) {
    const user = await User.findOne({ _id: loginUserId });
    return user;
  },

  async UpdateMe(data: UserType, loginUserId: string) {
    try {
      await User.updateOne({ _id: loginUserId }, data);
    } catch (error) {
      throw new Error("Update failed.");
    }
  },

  async updateConditionExpect(
    conditionExpect: Condition<"RANGE">,
    loginUserId: string,
  ) {
    await User.updateOne({ _id: loginUserId }, { conditionExpect });
  },

  async registerWebPushToken({
    userId,
    token,
  }: {
    userId: string;
    token: string;
  }) {
    return User.findByIdAndUpdate(userId, { registrationToken: token });
  },

  async sendWebPushMessage(props: {
    userId: Types.ObjectId;
    title: string;
    body: string;
  }) {
    const { userId, title, body } = props;
    const receiver = await User.findById(userId).lean();
    if (!receiver)
      throw new HttpException(400, "수신자의 정보를 찾을 수 없습니다.");
    const token = receiver.registrationToken;

    return getMessaging()
      .send({
        notification: {
          title,
          body,
        },
        token,
      })
      .then((response) => {
        // Response is a message ID string.
        console.log("Successfully sent message:", response);
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });
  },
};

export default userService;
