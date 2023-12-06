import { Response, Request } from "express";
import { Types } from "mongoose";
import alertService from "../services/alertService.js";
import { Alert } from "../models/index.js";

interface RequestHasBody<T> extends Request {
  body: T;
}

// TODO: 쿠키에서 토큰 파싱해서 유저 아이디 가져오기
// res.locals.userInfo에서 값 꺼내기
const alertController = {
  async getAlerts(_: any, res: Response) {
    const loginUserId = res.locals.userInfo._id;
    const alerts = await alertService.getAlertsAll({
      loginUserId: new Types.ObjectId(loginUserId),
    });
    res.status(200).json(alerts);
  },

  async readAlert(req: Request<{ alertId?: Types.ObjectId }>, res: Response) {
    const { alertId } = req.params;

    if (!alertId) {
      res.status(400).json({ message: "undefined alertId" });
      // TODO: 에러 핸들링
      return;
    }

    await alertService.updateById({ alertId });
    res.status(200).end();
  },

  async deleteAlerts(
    req: RequestHasBody<{ alertIds?: Types.ObjectId[] }>,
    res: Response,
  ) {
    const { alertIds } = req.body;

    if (!alertIds || alertIds.length === 0) {
      res.status(400).json({ message: "undefined alertId" });
      // TODO: 에러 핸들링
      return;
    }

    await alertService.removeByIds({ alertIds });
    res.status(200).end();
  },
};

export default alertController;
