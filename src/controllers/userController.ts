import { Request, Response } from "express";
import userService from "../services/userService.js";
import { Types } from "mongoose";

interface RequestHasBody<T> extends Request {
  body: T;
}

const userController = {
  async getUser(req: Request<{ id?: Types.ObjectId }>, res: Response) {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "undefined id" });
      // TODO: 에러 핸들링
      return;
    }

    const user = await userService.getUser({ id });
    res.status(200).json(user);
  },

  async getUserRecommend(_: any, res: Response) {
    const loginUserId = res.locals.userInfo._id;
    const users = await userService.getUserRecommend(loginUserId);
    res.status(200).json(users);
  },

  async updateConditionExpect(req: Request, res: Response) {
    const conditionExpect = req.body;
    const loginUserId = res.locals.userInfo._id;
    await userService.updateConditionExpect(conditionExpect, loginUserId);

    res.status(200).end();
  },

  async getUserMine(req: Request, res: Response) {
    const loginUserId = res.locals.userInfo._id;
    const user = await userService.getUserMain(loginUserId);

    res.status(200).json(user);
  },

  async updateMe(req: Request, res: Response) {
    const user = req.body;
    const loginUserId = res.locals.userInfo._id;
    await userService.UpdateMe(user, loginUserId);

    res.status(200).end();
  },

  // 이메일 인증번호 보내기
  async getAuthCode(req: Request, res: Response) {
    try {
      await userService.SendEmail(req.body.email);
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
      await userService.CheckAuthMail({ email, authCode });
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
      const newUser = await userService.SignUp(req.body);
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
      const { user, token } = await userService.SignIn(req.body.data);

      if (!user) throw new Error("undefined user");

      res.cookie("accessToken", token.accessToken, {
        httpOnly: true,
      });
      res.cookie("refreshToken", token.refreshToken, {
        httpOnly: true, //  자바스크립트로 브라우저의 쿠키에 접근하는 것을 막기 위한 옵션
      });

      res.status(200).json(user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(400).json(err!.message);
      }
    }
  },

  async registerWebPushToken(
    req: RequestHasBody<{ token: string }>,
    res: Response,
  ) {
    try {
      const { token } = req.body;
      const user = res.locals.userInfo;
      await userService.registerWebPushToken({ userId: user._id, token });
      res.status(201).end();
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json(err.message);
      }
    }
  },
};

export default userController;
