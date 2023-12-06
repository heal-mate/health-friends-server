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

// TODO: 쿠키에서 토큰 파싱해서 유저 아이디 가져오기
// const MOCK_USER_ID = "65654d023948df4dfd0cf108";

const matchController = {
  async getMatchesReceived(_: any, res: Response) {
    const matchesReceived = await matchService.getMatchesReceived();
    res.status(200).json(matchesReceived);
  },

  async getMatchesSent(_: any, res: Response) {
    const matchesSent = await matchService.getMatchesSent();
    res.status(200).json(matchesSent);
  },

  async requestMatch(
    req: RequestHasBody<{ userId?: Types.ObjectId }>,
    res: Response,
  ) {
    const { userId } = req.body;
    const user = res.locals.userInfo as User;
    //이미 등록된 match가 있는지도 체크해야할 듯!
    if (!userId) {
      res.status(400).json({ message: "undefined userId" });
      // TODO: 에러 핸들링
      return;
    }

    const newMatchInfo = await matchService.requestMatch({ userId });
    // 알람 등록(메이트 요청)
    await alertService.createAlert({
      matchId: newMatchInfo!._id,
      status: matchStatusDict.waiting,
    });

    // 웹 푸시 전송
    await userService.sendWebPushMessage({
      registrationToken: user.registrationToken,
      title: `[HELF] 매치 요청이 왔습니다.`,
      body: `${user.nickName}님, 매치 요청이 왔습니다. 지금 바로 확인해보세요.`,
    });

    res.status(201).end();
  },

  async cancelMatch(req: Request<{ matchId?: Types.ObjectId }>, res: Response) {
    const { matchId } = req.params;
    if (!matchId) {
      res.status(400).json({ message: "undefined matchId" });
      // TODO: 에러 핸들링
      return;
    }

    await matchService.cancelMatch({ matchId });

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
