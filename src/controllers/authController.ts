import { Request, Response } from "express";
import authService from "../services/authService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpException } from "../middleware/errorHandler.js";
const authController = {
  // 이메일 인증번호 보내기
  authCode: asyncHandler(async (req: Request, res: Response) => {
    await authService.sendEmail(req.body.email);
    res.status(200).end();
  }),

  // 인증번호 체크하기
  checkAuthCode: asyncHandler(async (req: Request, res: Response) => {
    const { email, authCode } = req.body.data;
    await authService.checkAuthMail({ email, authCode });
    res.status(200).end();
  }),

  //회원가입하기
  registerUser: asyncHandler(async (req: Request, res: Response) => {
    const newUser = await authService.signUp(req.body);
    if (newUser) {
      await authService.removeAuthMail(newUser.email);
    }
    res.status(200).json(newUser);
  }),

  //로그인
  loginUser: asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await authService.signIn(req.body.data);

    if (!user) throw new Error("undefined user");

    res.cookie("accessToken", token.accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.cookie("refreshToken", token.refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json(user);
  }),

  logoutUser: asyncHandler(async (req: Request, res: Response) => {
    res.cookie("accessToken", "", {
      expires: new Date(0),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.cookie("refreshToken", "", {
      expires: new Date(0),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).end();
  }),

  // 비밀번호 변경하기
  updatePassword: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body.data;
    await authService.updatePassword({ email, password });
    res.status(200).end();
  }),

  checkUserToken: asyncHandler(async (req: Request, res: Response) => {
    const loginUserId = res.locals.userInfo._id;

    if (!loginUserId) {
      throw new HttpException(401, "유저 정보가 없습니다");
    }
    res.json(200).end();
  }),

  withdrawUser: asyncHandler(async (req: Request, res: Response) => {
    const loginUserId = res.locals.userInfo._id;
    await authService.withdrawUser({ userId: loginUserId });
    res.cookie("accessToken", "", {
      expires: new Date(0),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.cookie("refreshToken", "", {
      expires: new Date(0),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(200).end();
  }),
};

export default authController;
