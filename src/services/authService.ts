import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { MAX_EXPIRY_MINUTE } from "../config/constants.js";
import { createAcessToken, createRefreshToken } from "../utils/jwt.js";
import { Auth, User } from "../models/index.js";
import { User as UserType } from "../models/schemas/user.js";
import { HttpException } from "../middleware/errorHandler.js";
const authService = {
  //이메일 전송하기
  async sendEmail(email: string) {
    if (email === "") {
      throw new HttpException(400, `이메일을 입력해주세요.`);
    }
    let isOver = false;

    //이미 가입된 이메일이 있는지 확인
    const isEmailSaved = await User.findOne({ email, deletedAt: null });

    //이미 DB에 이메일이 있다면
    if (isEmailSaved) {
      throw new HttpException(400, "이미 등록되어 있는 이메일입니다.");
    }

    //이미 인증db에 정보가 있는지 확인
    const authInfo = await Auth.findOne({ email }).lean();
    if (authInfo) {
      if (new Date() < authInfo.expiredTime) {
        isOver = false;
        throw new HttpException(
          400,
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
  async checkAuthMail({
    email,
    authCode,
  }: {
    email: string;
    authCode: string;
  }) {
    const savedAuthInfo = await Auth.findOne({ email });

    if (!savedAuthInfo) {
      throw new HttpException(400, `인증메일 받기를 먼저 요청해주세요.`);
    }

    const isValidTime = new Date() < savedAuthInfo.expiredTime;
    if (!isValidTime) {
      throw new HttpException(
        400,
        "인증시간이 초과되었습니다. 다시 인증메일을 받아주세요.",
      );
    }
    if (savedAuthInfo.authCode !== authCode) {
      throw new HttpException(400, "인증번호가 일치하지 않습니다.");
    }
  },

  //유저 회원가입
  async signUp(userDTO: UserType & { location: string; gender: string }) {
    const { tel, nickName, email, gender, password, location } = userDTO;

    //이미 가입된 이메일이 있는지 찾아보기
    const isEmailSaved = await User.findOne({ email, deletedAt: null });

    //이미 DB에 이메일이 있다면
    if (isEmailSaved) {
      throw new HttpException(400, "이미 등록되어 있는 이메일입니다.");
    }

    const pwRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!pwRegex.test(password)) {
      throw new HttpException(
        400,
        "8글자 이상, 영문, 숫자, 특수문자 사용해주세요.",
      );
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
      deletedAt: null,
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
  async signIn(loginInfo: { email: string; password: string }) {
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
        profileImageSrc: user?.profileImageSrc,
      },
      token: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  },

  async withdrawUser({ userId }: { userId: string }) {
    console.log(userId);
    return User.findByIdAndUpdate(userId, { deletedAt: new Date() });
  },
};

export default authService;
