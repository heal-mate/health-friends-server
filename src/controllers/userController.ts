import { Request, Response } from "express";
import userService from "../services/userService.js";
import { Types } from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpException } from "../middleware/errorHandler.js";

interface RequestHasBody<T> extends Request {
  body: T;
}

const userController = {
  getUser: asyncHandler(
    async (req: Request<{ id?: Types.ObjectId }>, res: Response) => {
      const { id } = req.params;

      if (!id) {
        throw new HttpException(400, "undefined id");
      }

      const user = await userService.getUser({ id });
      res.status(200).json(user);
    },
  ),

  getUserRecommend: asyncHandler(async (_: any, res: Response) => {
    const loginUserId = res.locals.userInfo._id;
    const users = await userService.getUserRecommend(loginUserId);
    res.status(200).json(users);
  }),

  updateConditionExpect: asyncHandler(async (req: Request, res: Response) => {
    const conditionExpect = req.body;
    const loginUserId = res.locals.userInfo._id;
    await userService.updateConditionExpect(conditionExpect, loginUserId);

    res.status(200).end();
  }),

  getUserMine: asyncHandler(async (req: Request, res: Response) => {
    const loginUserId = res.locals.userInfo._id;
    const user = await userService.getUserMain(loginUserId);

    res.status(200).json(user);
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const user = req.body;
    const loginUserId = res.locals.userInfo._id;
    await userService.UpdateMe(user, loginUserId);

    res.status(200).end();
  }),

  // 이메일 인증번호 보내기
  getAuthCode: asyncHandler(async (req: Request, res: Response) => {
    await userService.SendEmail(req.body.email);
    res.status(200).end();
  }),

  // 인증번호 체크하기
  checkAuthCode: asyncHandler(async (req: Request, res: Response) => {
    const { email, authCode } = req.body.data;
    await userService.CheckAuthMail({ email, authCode });
    res.status(200).end();
  }),

  //회원가입하기
  registerUser: asyncHandler(async (req: Request, res: Response) => {
    const newUser = await userService.SignUp(req.body);
    res.status(200).json(newUser);
  }),

  //로그인
  loginUser: asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await userService.SignIn(req.body.data);

    if (!user) throw new HttpException(400, "undefined user");

    res.cookie("accessToken", token.accessToken, {
      httpOnly: true,
      // sameSite: "none",
      // secure: true,
    });
    res.cookie("refreshToken", token.refreshToken, {
      httpOnly: true, //  자바스크립트로 브라우저의 쿠키에 접근하는 것을 막기 위한 옵션
      // sameSite: "none",
      // secure: true,
    });

    res.status(200).json(user);
  }),

  registerWebPushToken: asyncHandler(
    async (req: RequestHasBody<{ token: string }>, res: Response) => {
      const { token } = req.body;
      const user = res.locals.userInfo;
      await userService.registerWebPushToken({ userId: user._id, token });
      res.status(201).end();
    },
  ),

  // 유효한 유저인지 확인
  isValidUser: asyncHandler(async (req: Request, res: Response) => {
    const loginUserInfo = res.locals.userInfo;
    res.status(400).json(loginUserInfo);
  }),
};

export default userController;
