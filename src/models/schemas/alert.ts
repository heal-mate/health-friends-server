import { Types, Schema } from "mongoose";
import { MatchStatus } from "../../config/constants";
import { MATCH_MODEL_NAME } from "./match.js";
export const ALERT_MODEL_NAME = "Alert";

export type AlertSchema = {
  _id: Types.ObjectId;
  matchId: Types.ObjectId;
  status: MatchStatus;
  isRead: boolean;
  deletedAt: Date | null;
};

export const AlertSchema = new Schema<AlertSchema>(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: MATCH_MODEL_NAME,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 속성 자동 생성
  },
);
