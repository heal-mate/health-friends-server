import { Types } from "mongoose";
import { Match } from "../models/index.js";
import { MatchSchema } from "../models/schemas/match.js";
import { matchStatusDict } from "../config/constants.js";

// TODO: 쿠키에서 토큰 파싱해서 유저 아이디 가져오기
const MOCK_USER_ID = "65654d023948df4dfd0cf108";

const matchService = {
  async getMatchesReceived() {
    return Match.find({ receiverId: MOCK_USER_ID });
  },

  async getMatchesSent() {
    return Match.find({ sentId: MOCK_USER_ID });
  },

  async requestMatch(props: { userId: Types.ObjectId }) {
    const { userId } = props;

    const matchInfo = {
      receiverId: userId,
      senderId: new Types.ObjectId(MOCK_USER_ID),
      status: "WAITING",
      receiverDeleteAt: null,
      senderDeleteAt: null,
      updatedAt: new Date(),
    } as Omit<MatchSchema, "_id">;

    Match.create(matchInfo);
  },

  async cancelMatch({ matchId }: { matchId: Types.ObjectId }) {
    Match.findByIdAndDelete(matchId);
  },

  async acceptMatch({ matchId }: { matchId: Types.ObjectId }) {
    const res = await Match.findByIdAndUpdate(matchId, {
      status: matchStatusDict.accepted,
      updatedAt: new Date(),
    });
    return res;
  },

  async rejectMatch({ matchId }: { matchId: Types.ObjectId }) {
    const res = await Match.findByIdAndUpdate(matchId, {
      status: matchStatusDict.rejected,
      updatedAt: new Date(),
    });
    return res;
  },
};

export default matchService;
