import { Types } from "mongoose";
import { Match, User } from "../models/index.js";
import { MatchSchema } from "../models/schemas/match.js";
import { matchStatusDict } from "../config/constants.js";
import { resolve4 } from "dns";

// TODO: 쿠키에서 토큰 파싱해서 유저 아이디 가져오기
// const MOCK_USER_ID = "65654d023948df4dfd0cf108"; //로니콜먼
const MOCK_USER_ID = "6564aabc5235915edc6b3510"; //제이팍

const matchService = {
  async getMatchesReceived() {
    return Match.find({ receiverId: new Types.ObjectId(MOCK_USER_ID) });
  },

  async getMatchesSent() {
    return Match.find({ senderId: new Types.ObjectId(MOCK_USER_ID) });
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

    await Match.create(matchInfo);

    // TODO: 트랜젝션 구현
    // 매치 생성 후 각각의 유저에게 서로를 추천 목록에 반영하지 않도록 exceptUserIds 배열에 추가
    const sender = await User.findById(MOCK_USER_ID);
    if (!sender) throw new Error("cannot create Match");
    sender.matchExceptUserIds.push(userId);
    await sender.save();

    const receiver = await User.findById(userId);
    if (!receiver) throw new Error("cannot create Match");
    receiver.matchExceptUserIds.push(new Types.ObjectId(MOCK_USER_ID));
    await receiver.save();
  },

  async cancelMatch({ matchId }: { matchId: Types.ObjectId }) {
    const match = await Match.findByIdAndDelete(matchId);
    if (!match) throw new Error("cannot cancel Match");

    // TODO: 트랜젝션 구현
    // 매치 취소(삭제) 후 각각의 제외 유저 목록에서 서로를 삭제
    const sender = await User.findById(MOCK_USER_ID);
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
