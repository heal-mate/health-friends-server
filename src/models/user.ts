import { Schema, model } from "mongoose";
import { locations, gender } from "../config/constants.js";

const UserSchema = new Schema({
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
      enum: [...gender, null],
    },
    location: {
      type: String,
      enum: [...locations, null],
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
      enum: [...gender, null],
    },
    location: {
      type: String,
      enum: [...locations, null],
    },
  },
  matchIds: {
    type: [String],
    required: true,
  },
});

export default model("User", UserSchema);
