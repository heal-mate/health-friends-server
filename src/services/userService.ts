import { Types } from "mongoose";
import { User } from "../models/index.js";
import { User as UserType } from "../models/schemas/user.js";
import { LOCATION } from "../config/constants.js";
import { Condition } from "../models/schemas/user.js";
import { getMessaging } from "firebase-admin/messaging";

const userService = {
  async getUser({ id }: { id: Types.ObjectId }) {
    const users = await User.findById(id).exec();

    return users;
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
    registrationToken: string;
    title: string;
    body: string;
  }) {
    const { registrationToken: token, title, body } = props;

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

// 나의 conditionExpect와 유저들의 condition을 비교하는 AND 쿼리 생성 함수
function makeRecommendUserQuery({
  myConditionExpect,
  matchExceptUserIds,
  loginUserId,
}: {
  myConditionExpect: Condition<"RANGE">;
  matchExceptUserIds: Types.ObjectId[];
  loginUserId: string;
}) {
  // 나의 condtionExpect와, 다른 유저들의 condition를 비교하기 위한 쿼리 타입
  type Query = {
    [key: string]:
      | {
          $gte: number;
          $lte: number;
        }
      | {
          $in: typeof LOCATION;
        }
      | {
          $eq: string;
        }
      | {
          $ne: Types.ObjectId;
        }
      | {
          $nin: Types.ObjectId[];
        };
  };

  // 나의 condtionExpect와, 다른 유저들의 condition을 비교하기 위한 AND 쿼리 배열
  const queries = [
    // 자기 자신을 제외하는 쿼리
    { _id: { $ne: new Types.ObjectId(loginUserId) } },
    // 제외할 유저 목록(매칭중, 블랙리스트 등)을 제외하는 쿼리
    { _id: { $nin: matchExceptUserIds } },
  ] as Query[];
  const { benchPress, squat, deadLift, fitnessYears, gender, location } =
    myConditionExpect;

  if (benchPress) {
    queries.push({
      "condition.benchPress": {
        $gte: benchPress[0],
        $lte: benchPress[1],
      },
    });
  }

  if (squat) {
    queries.push({
      "condition.squat": {
        $gte: squat[0],
        $lte: squat[1],
      },
    });
  }
  if (deadLift) {
    queries.push({
      "condition.deadLift": {
        $gte: deadLift[0],
        $lte: deadLift[1],
      },
    });
  }
  if (fitnessYears) {
    queries.push({
      "condition.fitnessYears": {
        $gte: fitnessYears[0],
        $lte: fitnessYears[1],
      },
    });
  }
  if (gender) {
    queries.push({
      "condition.gender": {
        $eq: gender,
      },
    });
  }
  if (location) {
    queries.push({
      "condition.location": {
        $in: location,
      },
    });
  }

  return queries;
}

// 나의 condition과 추천된 유저들의 conditionExpect를 비교, 필터링
function makeRecommendUserFilterCallback(myCondition: Condition<"POINT">) {
  return ({ conditionExpect }: { conditionExpect: Condition<"RANGE"> }) => {
    const { benchPress, squat, deadLift, fitnessYears, gender, location } =
      conditionExpect;
    if (
      benchPress &&
      (benchPress[0] > myCondition.benchPress ||
        benchPress[1] < myCondition.benchPress)
    ) {
      return false;
    }

    if (
      squat &&
      (squat[0] > myCondition.squat || squat[1] < myCondition.squat)
    ) {
      return false;
    }

    if (
      deadLift &&
      (deadLift[0] > myCondition.deadLift || deadLift[1] < myCondition.deadLift)
    ) {
      return false;
    }

    if (
      fitnessYears &&
      (fitnessYears[0] > myCondition.fitnessYears ||
        fitnessYears[1] < myCondition.fitnessYears)
    ) {
      return false;
    }

    if (gender && gender !== myCondition.gender) {
      return false;
    }

    if (location && !location.includes(myCondition.location)) {
      return false;
    }
    return true;
  };
}
