import { Types } from "mongoose";
import { Match, User } from "../models/index.js";
import { MatchSchema } from "../models/schemas/match.js";
import { matchStatusDict } from "../config/constants.js";

const matchService = {
  async getMatchesReceived(loginUserId: string) {
    return Match.find({ receiverId: new Types.ObjectId(loginUserId) });
  },

  async getMatchesSent(loginUserId: string) {
    return Match.find({ senderId: new Types.ObjectId(loginUserId) });
  },

  async requestMatch(props: {
    receiverId: Types.ObjectId;
    loginUserId: string;
  }) {
    const { receiverId, loginUserId } = props;

    const matchInfo = {
      receiverId,
      senderId: new Types.ObjectId(loginUserId),
      status: "WAITING",
      receiverDeleteAt: null,
      senderDeleteAt: null,
      updatedAt: new Date(),
    } as Omit<MatchSchema, "_id">;

    const newMatch = await Match.create(matchInfo);

    // TODO: 트랜젝션 구현
    // 매치 생성 후 각각의 유저에게 서로를 추천 목록에 반영하지 않도록 exceptUserIds 배열에 추가
    const sender = await User.findById(loginUserId);
    if (!sender) throw new Error("cannot create Match");
    sender.matchExceptUserIds.push(receiverId);
    await sender.save();

    const receiver = await User.findById(receiverId);
    if (!receiver) throw new Error("cannot create Match");
    receiver.matchExceptUserIds.push(new Types.ObjectId(loginUserId));
    await receiver.save();

    return newMatch;
  },

  async cancelMatch({
    matchId,
    loginUserId,
  }: {
    matchId: Types.ObjectId;
    loginUserId: string;
  }) {
    const match = await Match.findByIdAndDelete(matchId).lean();
    if (!match) throw new Error("cannot cancel Match");

    // TODO: 트랜젝션 구현
    // 매치 취소(삭제) 후 각각의 제외 유저 목록에서 서로를 삭제
    const sender = await User.findById(loginUserId);
    if (!sender) throw new Error("cannot cancel Match");
    const indexReceiver = sender.matchExceptUserIds.findIndex((e) => {
      return e.toString() === match.receiverId.toString();
    });
    if (indexReceiver === -1) throw new Error("cannot cancel Match");
    sender.matchExceptUserIds.splice(indexReceiver, 1);
    await sender.save();

    const receiver = await User.findById(match.receiverId);
    if (!receiver) throw new Error("cannot cancel Match");
    const indexSender = receiver.matchExceptUserIds.findIndex((e) => {
      return e.toString() === match.senderId.toString();
    });
    if (indexSender === -1) throw new Error("cannot cancel Match");
    receiver.matchExceptUserIds.splice(indexSender, 1);
    await sender.save();
  },

  async acceptMatch({ matchId }: { matchId: Types.ObjectId }) {
    const res = await Match.findByIdAndUpdate(
      matchId,
      {
        status: matchStatusDict.accepted,
        updatedAt: new Date(),
      },
      { new: true },
    );
    return res;
  },

  async rejectMatch({ matchId }: { matchId: Types.ObjectId }) {
    const res = await Match.findByIdAndUpdate(
      matchId,
      {
        status: matchStatusDict.rejected,
        updatedAt: new Date(),
      },
      { new: true },
    );
    return res;
  },
};

export default matchService;
