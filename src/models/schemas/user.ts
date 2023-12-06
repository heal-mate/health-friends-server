import { ObjectId } from "mongodb";
import { Schema, Types } from "mongoose";
import { GENDER, LOCATION } from "../../config/constants.js";
import { MATCH_MODEL_NAME } from "./match.js";

export const USER_MODEL_NAME = "User";

export type User = {
  _id: Types.ObjectId;
  email: string;
  password: string;
  tel: string;
  nickName: string;
  profileImageSrc: string;
  introduction: string;
  condition: Condition<"POINT">;
  conditionExpect: Condition<"RANGE">;
  matchIds: Array<Types.ObjectId>;
  matchExceptUserIds: Array<Types.ObjectId>;
  refreshToken: string;
  registrationToken: string;
  deletedAt: Date;
};

export type Condition<T = "POINT"> = {
  benchPress: T extends "RANGE" ? [number, number] | null : number;
  squat: T extends "RANGE" ? [number, number] | null : number;
  deadLift: T extends "RANGE" ? [number, number] | null : number;
  fitnessYears: T extends "RANGE" ? [number, number] | null : number;
  gender: T extends "RANGE" ? "MALE" | "FEMALE" | null : "MALE" | "FEMALE";
  location: T extends "RANGE"
    ? typeof LOCATION | null
    : (typeof LOCATION)[number];
};

export const UserSchema = new Schema<User>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    // 영문대문자, 영문소문자, 숫자, 특수문자 조합으로 이루어진 8~15자의 문자열
    password: { type: String, minlength: 8, required: true },
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
      default:
        "https://res.cloudinary.com/djq2j6rkq/image/upload/t_test/v1701853513/dcihbvpm3nvffbz2jzds.png",
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
    deletedAt: {
      type: Date,
      required: false,
    },
    refreshToken: { type: String, required: false },
    registrationToken: { type: String, required: false },
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
  },
  {
    timestamps: true,
  },
);
