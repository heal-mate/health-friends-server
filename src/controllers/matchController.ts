import { Response, Request } from "express";
import { Types } from "mongoose";
import matchService from "../services/matchService.js";

interface RequestHasBody<T> extends Request {
  body: T;
}

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
    if (!userId) {
      res.status(400).json({ message: "undefined userId" });
      // TODO: 에러 핸들링
      return;
    }

    await matchService.requestMatch({ userId });

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
    const { matchId } = req.params;
    if (!matchId) {
      res.status(400).json({ message: "undefined matchId" });
      // TODO: 에러 핸들링
      return;
    }

    await matchService.acceptMatch({ matchId });

    res.status(200).end();
  },

  async rejectMatch(req: Request<{ matchId?: Types.ObjectId }>, res: Response) {
    const { matchId } = req.params;
    if (!matchId) {
      res.status(400).json({ message: "undefined matchId" });
      // TODO: 에러 핸들링
      return;
    }

    await matchService.rejectMatch({ matchId });

    res.status(200).end();
  },
};

export default matchController;
