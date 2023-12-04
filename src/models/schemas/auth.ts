import { Types, Schema } from "mongoose";

export const AUTH_MODEL_NAME = "Auth";

export type AuthSchema = {
  _id: Types.ObjectId;
  email: string;
  authCode: string;
  expiredTime: Date;
};

export const AuthSchema = new Schema<AuthSchema>({
  email: {
    type: String,
    required: true,
  },
  authCode: {
    type: String,
    required: true,
  },
  expiredTime: {
    type: Date,
    required: true,
  },
});
