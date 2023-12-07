import { Request, Response } from "express";
import authService from "../services/authService.js";

const authController = {
  // 이메일 인증번호 보내기
  async authCode(req: Request, res: Response) {
    try {
      await authService.sendEmail(req.body.email);
      res.status(200).end();
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(400).json(err.message);
      }
    }
  },

  // 인증번호 체크하기
  async checkAuthCode(req: Request, res: Response) {
    const { email, authCode } = req.body.data;
    try {
      await authService.checkAuthMail({ email, authCode });
      res.status(200).end();
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(400).json(err.message);
      }
    }
  },

  //회원가입하기
  async registerUser(req: Request, res: Response) {
    try {
      const newUser = await authService.signUp(req.body);
      res.status(200).json(newUser);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(400).json(err.message);
      }
    }
  },

  //로그인
  async loginUser(req: Request, res: Response) {
    try {
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(400).json(err!.message);
      }
    }
  },
};

export default authController;
