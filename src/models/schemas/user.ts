import { ObjectId } from "mongodb";
import { Schema, Types } from "mongoose";
import { GENDER, LOCATION } from "../../config/constants.js";
import { MATCH_MODEL_NAME } from "./match.js";

export const USER_MODEL_NAME = "User";

export type User = {
  _id: Types.ObjectId;
  email: string;
  tel: string;
  nickName: string;
  profileImageSrc: string;
  introduction: string;
  condition: Condition<"POINT">;
  conditionExpect: Condition<"RANGE">;
  matchIds: Array<Types.ObjectId>;
  matchExceptUserIds: Array<Types.ObjectId>;
};

export type Condition<T = "POINT"> = {
  benchPress: T extends "RANGE" ? [number, number] | null : number;
  squat: T extends "RANGE" ? [number, number] | null : number;
  deadLift: T extends "RANGE" ? [number, number] | null : number;
  fitnessYears: T extends "RANGE" ? [number, number] | null : number;
  gender: T extends "RANGE" ? "MALE" | "FEMAIL" | null : "MALE" | "FEMAIL";
  location: T extends "RANGE"
    ? typeof LOCATION | null
    : (typeof LOCATION)[number];
};

export const UserSchema = new Schema<User>({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  tel: {
    type: String,
    required: true,
  },
  nickName: {
    type: String,
    required: true,
  },
  profileImageSrc: {
    type: String,
    required: true,
  },
  introduction: {
    type: String,
    required: true,
  },
  condition: {
    required: true,
    type: {
      benchPress: {
        type: Number,
        required: true,
      },
      squat: {
        type: Number,
        required: true,
      },
      deadLift: {
        type: Number,
        required: true,
      },
      fitnessYears: {
        type: Number,
        required: true,
      },
      gender: {
        type: String,
        enum: GENDER,
        required: true,
      },
      location: {
        type: String,
        enum: LOCATION,
        required: true,
      },
    },
  },
  conditionExpect: {
    required: true,
    default: null,
    type: {
      benchPress: {
        type: [Number, Number],
        default: null,
      },
      squat: {
        type: [Number, Number],
        default: null,
      },
      deadLift: {
        type: [Number, Number],
        default: null,
      },
      fitnessYears: {
        type: [Number, Number],
        default: null,
      },
      gender: {
        type: String,
        enum: [...GENDER, null],
        required: false,
      },
      location: {
        type: [String],
        enum: [...LOCATION, null],
        required: false,
      },
    },
  },
  matchIds: [
    {
      type: ObjectId,
      ref: MATCH_MODEL_NAME,
    },
  ],
  matchExceptUserIds: [
    {
      type: ObjectId,
      ref: USER_MODEL_NAME,
    },
  ],
});
