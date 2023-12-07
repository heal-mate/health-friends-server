import { Types } from "mongoose";
import { Condition } from "../models/schemas/user";
import { LOCATION } from "../config/constants";

// 나의 conditionExpect와 유저들의 condition을 비교하는 AND 쿼리 생성 함수
export function makeRecommendUserQuery({
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
export function makeRecommendUserFilterCallback(
  myCondition: Condition<"POINT">,
) {
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
