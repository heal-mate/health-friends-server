import { Response, Request } from "express";
import { Types } from "mongoose";
import matchService from "../services/matchService.js";
import alertService from "../services/alertService.js";
import { matchStatusDict } from "../config/constants.js";
import userService from "../services/userService.js";
import { User } from "../models/schemas/user.js";

interface RequestHasBody<T> extends Request {
  body: T;
}

const matchController = {
  async getMatchesReceived(_: any, res: Response) {
    const loginUserId = res.locals.userInfo._id;
    const matchesReceived = await matchService.getMatchesReceived(loginUserId);
    res.status(200).json(matchesReceived);
  },

  async getMatchesSent(_: any, res: Response) {
    const loginUserId = res.locals.userInfo._id;
    const matchesSent = await matchService.getMatchesSent(loginUserId);
    res.status(200).json(matchesSent);
  },

  async requestMatch(
    req: RequestHasBody<{ userId?: Types.ObjectId }>,
    res: Response,
  ) {
    const loginUserId = res.locals.userInfo._id;
    const { userId: receiverId } = req.body;
    // TODO: 이미 등록된 match가 있는지도 체크해야할 듯!
    if (!receiverId) {
      res.status(400).json({ message: "undefined userId" });
      // TODO: 에러 핸들링
      return;
    }

    const newMatchInfo = await matchService.requestMatch({
      receiverId,
      loginUserId,
    });
    // 알람 등록(메이트 요청)
    await alertService.createAlert({
      matchId: newMatchInfo!._id,
      status: matchStatusDict.waiting,
    });

    // 웹 푸시 전송
    await userService.sendWebPushMessage({
      registrationToken: loginUserId.registrationToken,
      title: `[HELF] 매치 요청이 왔습니다.`,
      body: `${loginUserId.nickName}님, 매치 요청이 왔습니다. 지금 바로 확인해보세요.`,
    });

    res.status(201).end();
  },

  async cancelMatch(req: Request<{ matchId: Types.ObjectId }>, res: Response) {
    const loginUserId = res.locals.userInfo._id;
    const { matchId } = req.params;
    if (!matchId) {
      res.status(400).json({ message: "undefined matchId" });
      // TODO: 에러 핸들링
      return;
    }

    await matchService.cancelMatch({ matchId, loginUserId });

    res.status(200).end();
  },

  async acceptMatch(req: Request<{ matchId?: Types.ObjectId }>, res: Response) {
    const user = res.locals.userInfo as User;
    const { matchId } = req.params;
    if (!matchId) {
      res.status(400).json({ message: "undefined matchId" });
      // TODO: 에러 핸들링
      return;
    }

    const newMatchInfo = await matchService.acceptMatch({ matchId });

    // TODO: 에러 핸들링 :
    if (!newMatchInfo) throw new Error("cannot find newMatchInfo");

    // 알람 등록(메이트 수락)
    await alertService.createAlert({
      matchId: newMatchInfo._id,
      status: matchStatusDict.accepted,
    });

    // 웹 푸시 전송
    await userService.sendWebPushMessage({
      registrationToken: user.registrationToken,
      title: `[HELF] 매치가 수락되었습니다.`,
      body: `${user.nickName}님, 매치가 성사되었습니다. 지금 바로 확인해보세요.`,
    });

    res.status(200).end();
  },

  async rejectMatch(req: Request<{ matchId?: Types.ObjectId }>, res: Response) {
    const user = res.locals.userInfo as User;
    const { matchId } = req.params;
    if (!matchId) {
      res.status(400).json({ message: "undefined matchId" });
      // TODO: 에러 핸들링
      return;
    }

    const newMatchInfo = await matchService.rejectMatch({ matchId });

    // TODO: 에러 핸들링 :
    if (!newMatchInfo) throw new Error("cannot find newMatchInfo");

    // 알람 등록(메이트 거절)
    await alertService.createAlert({
      matchId: newMatchInfo._id,
      status: matchStatusDict.rejected,
    });

    // 웹 푸시 전송
    await userService.sendWebPushMessage({
      registrationToken: user.registrationToken,
      title: `[HELF] 매치가 거절되었습니다.`,
      body: `${user.nickName}님, 매치가 거절되었습니다. 지금 바로 확인해보세요.`,
    });

    res.status(200).end();
  },
};

export default matchController;
