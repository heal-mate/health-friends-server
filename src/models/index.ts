import { model } from "mongoose";
import { matchSchema, modelName as matchModelName } from "./schemas/match.js";
import { UserSchema, modelName as userModelName } from "./schemas/user.js";

export const Match = model(matchModelName, matchSchema);
export const User = model(userModelName, UserSchema);
