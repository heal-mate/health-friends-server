import { ObjectId } from "mongodb";
import { Schema } from "mongoose";
import { GENDER, LOCATION } from "../../config/constants.js";
import { modelName as matchModelName } from "./match.js";

export const modelName = "User";

export type User = {
  id: string;
  email: string;
  tel: string;
  nickName: string;
  profileImageSrc: string;
  introduction: string;
  condition: Condition<"POINT">;
  conditionExpect: Condition<"RANGE">;
  matchIds: Array<string>;
};

export type Condition<T = "POINT"> = {
  benchPress: T extends "RANGE" ? [number, number] | null : number;
  squat: T extends "RANGE" ? [number, number] | null : number;
  deadLift: T extends "RANGE" ? [number, number] | null : number;
  fitnessYears: T extends "RANGE" ? [number, number] | null : number;
  gender: T extends "RANGE" ? "MALE" | "FEMAIL" | null : "MALE" | "FEMAIL";
  location: T extends "RANGE" ? Location[] | null : Location;
};

export const UserSchema = new Schema({
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
    benchPress: {
      type: Number,
    },
    squat: {
      type: Number,
    },
    deadLift: {
      type: Number,
    },
    fitnessYears: {
      type: Number,
    },
    gender: {
      type: String,
      enum: GENDER,
    },
    location: {
      type: String,
      enum: LOCATION,
    },
  },
  conditionExpect: {
    benchPress: {
      type: [Number, Number],
    },
    squat: {
      type: [Number, Number],
    },
    deadLift: {
      type: [Number, Number],
    },
    fitnessYears: {
      type: [Number, Number],
    },
    gender: {
      type: String,
      enum: GENDER,
    },
    location: {
      type: [String],
      enum: LOCATION,
    },
  },
  matchIds: [
    {
      type: ObjectId,
      ref: matchModelName,
    },
  ],
});
