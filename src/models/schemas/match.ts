import { Schema, Types } from "mongoose";
import { MATCH_STATUS, MatchStatus } from "../../config/constants.js";

export const MATCH_MODEL_NAME = "Match";

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
    ref: MATCH_MODEL_NAME,
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: MATCH_MODEL_NAME,
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
