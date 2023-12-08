import { Types } from "mongoose";
import { User, Auth } from "../models/index.js";
import { User as UserType } from "../models/schemas/user.js";
import { GENDER, LOCATION, MAX_EXPIRY_MINUTE } from "../config/constants.js";
import { Condition } from "../models/schemas/user.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { createAcessToken, createRefreshToken } from "../utils/jwt.js";
import { getMessaging } from "firebase-admin/messaging";
import { HttpException } from "../middleware/errorHandler.js";
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

  //이메일 전송하기
  async SendEmail(email: string) {
    if (email === "") {
      throw new Error(`이메일을 입력해주세요.`);
    }
    let isOver = false;

    //이미 인증db에 정보가 있는지 확인
    const authInfo = await Auth.findOne({ email }).lean();
    if (authInfo) {
      if (new Date() < authInfo.expiredTime) {
        isOver = false;
        throw new Error(
          `이미 인증번호가 발송되었습니다. ${MAX_EXPIRY_MINUTE}분 뒤에 다시 요청해주세요.`,
        );
      } else {
        isOver = true;
      }
    }

    const transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.GOOGLE_APP_KEY,
      },
    });

    const authCode = Math.random().toString(36).slice(2);
    const message = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "헬스프렌즈 인증번호",
      text: authCode,
    };

    // 인증코드 유효기간 설정
    let expiredTime = new Date();
    expiredTime.setMinutes(expiredTime.getMinutes() + MAX_EXPIRY_MINUTE);

    transport.sendMail(message, async (err, info) => {
      if (err) {
        return new Error(err.message);
      } else {
        console.log("success to mail: ", info.envelope);
        if (isOver) {
          await Auth.findOneAndUpdate(
            { email },
            {
              authCode,
              expiredTime,
            },
          );
        } else {
          await Auth.create({
            email,
            authCode,
            expiredTime,
          });
        }
      }
    });
  },

  // 인증번호 확인
  async CheckAuthMail({
    email,
    authCode,
  }: {
    email: string;
    authCode: string;
  }) {
    const savedAuthInfo = await Auth.findOne({ email });

    if (!savedAuthInfo) {
      throw new Error(`인증메일 받기를 먼저 요청해주세요.`);
    }

    const isValidTime = new Date() < savedAuthInfo.expiredTime;
    if (!isValidTime) {
      throw new Error("인증시간이 초과되었습니다. 다시 인증메일을 받아주세요.");
    }
    if (savedAuthInfo.authCode !== authCode) {
      throw new Error("인증번호가 일치하지 않습니다.");
    }
  },

  //유저 회원가입
  async SignUp(userDTO: UserType & { location: string; gender: string }) {
    const { tel, nickName, email, gender, password, location } = userDTO;

    //이미 가입된 이메일이 있는지 찾아보기
    const isEmailSaved = await User.findOne({ email, deletedAt: null });

    //이미 DB에 이메일이 있다면
    if (isEmailSaved) {
      throw new Error("이미 등록되어 있는 이메일입니다.");
    }

    const pwRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!pwRegex.test(password)) {
      throw new Error("8글자 이상, 영문, 숫자, 특수문자 사용해주세요.");
    }

    //DB에 이메일이 없다면
    const user = new User({
      email,
      tel,
      nickName,
      password,
      introduction: "소개를 입력해주세요.",
      condition: {
        benchPress: 0,
        squat: 0,
        deadLift: 0,
        fitnessYears: 0,
        gender,
        location,
      },
      conditionExpect: {},
    });

    //비밀번호 암호화 하기
    const salt = await bcrypt.genSalt(10); //바이트 단위의 임의의 문자열 salt생성
    user.password = await bcrypt.hash(user.password, salt); //비밀번호 + salt로 암호화된 비밀번호 생성

    const newUser = await user.save(); //새로운 유저 저장

    return {
      id: newUser?._id,
      nickName: newUser?.nickName,
      email: newUser?.email,
      tel: newUser?.tel,
      profileImageSrc: newUser?.profileImageSrc,
      introduction: newUser?.introduction,
      condition: newUser?.condition,
      conditionExpect: newUser?.conditionExpect,
    };
  },

  //로그인
  async SignIn(loginInfo: { email: string; password: string }) {
    const { email, password } = loginInfo;

    //DB에서 유저정보 찾기
    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
      throw new HttpException(400, "가입된 유저가 아닙니다.");
    }

    //입력한 비밀번호와 DB의 비밀번호 같은지 비교
    const isValidPassword = await bcrypt.compare(password, user?.password);

    //만약 유저정보가 없거나 비밀번호가 동일하지 않다면
    if (!isValidPassword) {
      throw new HttpException(400, "이메일 또는 비밀번호가 일치하지 않습니다.");
    }

    //로그인 성공 후
    const accessToken = createAcessToken(user);
    const refreshToken = createRefreshToken(user);

    //새로 발급한 refreshToken을 DB 유저 스키마에 저장
    await User.findByIdAndUpdate(user._id, {
      refreshToken,
    });

    return {
      user: {
        id: user?._id,
      },
      token: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
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
