import { Types } from "mongoose";
import { Alert, Match, User } from "../models/index.js";
import { AlertSchema } from "../models/schemas/alert.js";
import { MatchStatus, matchStatusDict } from "../config/constants.js";

const alertService = {
  async getAlertsAll({ loginUserId }: { loginUserId: Types.ObjectId }) {
    const alerts = await Alert.aggregate([
      {
        $match: {
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: "matches",
          localField: "matchId",
          foreignField: "_id",
          as: "matchInfo",
        },
      },
      {
        $match: {
          $or: [
            {
              "matchInfo.senderId": loginUserId,
              $or: [
                { status: matchStatusDict.accepted },
                { status: matchStatusDict.rejected },
              ],
            },
            {
              "matchInfo.receiverId": loginUserId,
              status: matchStatusDict.waiting,
            },
          ],
        },
      },
      {
        $unwind: "$matchInfo",
      },
      {
        $project: {
          matchId: 1,
          senderId: "$matchInfo.senderId",
          receiverId: "$matchInfo.receiverId",
          status: 1,
          isRead: 1,
          createdAt: 1,
        },
      },
    ]).sort({ createdAt: -1 });

    const populateQuery = [
      {
        path: "senderId",
        select: "nickName",
      },
      {
        path: "receiverId",
        select: "nickName",
      },
    ];

    const result = User.populate(alerts, populateQuery);

    return result;
  },

  // matchService.requestMatch에서 props받기
  async createAlert(props: { matchId: Types.ObjectId; status: MatchStatus }) {
    const { matchId, status } = props;

    const alertInfo: Omit<AlertSchema, "_id" | "isRead" | "deletedAt"> = {
      matchId,
      status,
    };

    await Alert.create(alertInfo);
  },

  async updateById({ alertId }: { alertId: Types.ObjectId }) {
    await Alert.findByIdAndUpdate(alertId, {
      isRead: true,
    });
  },

  async removeByIds({ alertIds }: { alertIds: Types.ObjectId[] }) {
    await Alert.updateMany(
      { _id: { $in: alertIds } },
      {
        $set: { deletedAt: new Date() },
      },
    );
  },
};

export default alertService;
