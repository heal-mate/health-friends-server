import { Schema, Types } from "mongoose";
import { MATCH_STATUS, MatchStatus } from "../../config/constants.js";
export const modelName = "Match";

export type MatchSchema = {
  _id: Types.ObjectId;
  receiverId: Types.ObjectId;
  senderId: Types.ObjectId;
  status: MatchStatus;
  receiverDeleteAt: Date | null;
  senderDeleteAt: Date | null;
  updatedAt: Date;
};

export const matchSchema = new Schema<MatchSchema>({
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: modelName,
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: modelName,
    required: true,
  },
  status: {
    type: String,
    enum: MATCH_STATUS,
    required: true,
  },
  receiverDeleteAt: {
    type: Date,
    default: null,
  },
  senderDeleteAt: {
    type: Date,
    default: null,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
});
