import { Types } from "mongoose";
import { User } from "../models/index.js";
import { LOCATION } from "../config/constants.js";

const MOCK_USER_ID = "6564aabc5235915edc6b3510";

const userService = {
  async getUser({ id }: { id: Types.ObjectId }) {
    const users = await User.findById(id).exec();

    return users;
  },

  /**
   * 나의 conditionExpect와 유저들의 condition을 비교하는 AND 쿼리로 얻은 usersRecommended를
   * 나의 condition과 유저들의 conditionExpect를 비교해 걸러주는 filter 메서드를 사용해 추천 유저 획득
   * */
  async getUserRecommend() {
    // recommend를 요청한 user의 정보
    const userRequested = await User.findById(MOCK_USER_ID).lean();
    if (!userRequested) return;

    const { condition: myCondition, conditionExpect: myConditionExpect } =
      userRequested;

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
          };
    };

    // 나의 condtionExpect와, 다른 유저들의 condition을 비교하기 위한 AND 쿼리 배열
    const queries = Object.entries(myConditionExpect)
      .flatMap<Query>(([key, value]) => {
        if (!value && key === "_id") return [];

        if (value instanceof Array && typeof value[0] === "number") {
          return [
            {
              [`condition.${key}`]: {
                $gte: value[0],
                $lte: value[1],
              },
            },
          ];
        } else if (value instanceof Array && typeof value[0] === "string") {
          return [
            {
              [`condition.${key}`]: {
                $in: value,
              },
            },
          ];
        } else if (typeof value === "string") {
          return [
            {
              [`condition.${key}`]: {
                $eq: value,
              },
            },
          ];
        } else {
          return [];
        }
      })
      // 자기 자신을 제외하는 쿼리
      .concat({ _id: { $ne: new Types.ObjectId(MOCK_USER_ID) } });

    const findByMyConditionExpect = async () => {
      if (queries.length <= 1) {
        // 쿼리가 1개 있을 때는 _id not_equal 쿼리임 (자기 자신을 제외하는 쿼리)
        return User.find({ ...queries[0] }).lean();
      } else if (queries.length > 1) {
        return User.find({ $and: queries }).lean();
      }
    };

    const usersRecommended = await findByMyConditionExpect();

    if (!usersRecommended) return [];

    return (
      usersRecommended
        // 나의 condition과 다른 유저들의 conditionExpect를 비교, 필터링하는 작업
        .filter((userRecommended) => {
          return !Object.entries(userRecommended.conditionExpect).some(
            ([key, othersExpectedCondition]) => {
              if (!othersExpectedCondition) return false;
              if (
                othersExpectedCondition instanceof Array &&
                typeof othersExpectedCondition[0] === "number"
              ) {
                const myConditionAssert = (myCondition as any)[key] as number;
                return (
                  myConditionAssert < othersExpectedCondition[0] ||
                  myConditionAssert > othersExpectedCondition[1]
                );
              } else if (
                othersExpectedCondition instanceof Array &&
                typeof othersExpectedCondition[0] === "string"
              ) {
                const myConditionAssert = (myCondition as any)[
                  key
                ] as (typeof LOCATION)[number];
                return !othersExpectedCondition.includes(myConditionAssert);
              } else if (typeof othersExpectedCondition !== "string") {
                const myConditionAssert = (myCondition as any)[key] as string;
                return myConditionAssert !== othersExpectedCondition;
              } else {
                return false;
              }
            },
          );
        })
        .slice(0, 5)
    );
  },
};

export default userService;
