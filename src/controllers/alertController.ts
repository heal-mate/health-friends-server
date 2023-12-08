import { Response, Request } from "express";
import { Types } from "mongoose";
import alertService from "../services/alertService.js";
import { Alert } from "../models/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpException } from "../middleware/errorHandler.js";
interface RequestHasBody<T> extends Request {
  body: T;
}

// TODO: 쿠키에서 토큰 파싱해서 유저 아이디 가져오기
// res.locals.userInfo에서 값 꺼내기
const alertController = {
  getAlerts: asyncHandler(async (_: any, res: Response) => {
    const loginUserId = res.locals.userInfo._id;
    const alerts = await alertService.getAlertsAll({
      loginUserId: new Types.ObjectId(loginUserId),
    });
    res.status(200).json(alerts);
  }),

  readAlert: asyncHandler(
    async (req: Request<{ alertId?: Types.ObjectId }>, res: Response) => {
      const { alertId } = req.params;

      if (!alertId) {
        throw new HttpException(400, "undefined alertId");
      }

      await alertService.updateById({ alertId });
      res.status(200).end();
    },
  ),

  deleteAlerts: asyncHandler(
    async (
      req: RequestHasBody<{ alertIds?: Types.ObjectId[] }>,
      res: Response,
    ) => {
      const { alertIds } = req.body;

      if (!alertIds || alertIds.length === 0) {
        throw new HttpException(400, "undefined alertId");
      }

      await alertService.removeByIds({ alertIds });
      res.status(200).end();
    },
  ),
};

export default alertController;
