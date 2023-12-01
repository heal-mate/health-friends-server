import { model } from "mongoose";
import { matchSchema, modelName as matchModelName } from "./schemas/match.js";
import { UserSchema, modelName as userModelName } from "./schemas/user.js";
import { AlertSchema, modelName as alertModelName } from "./schemas/alert.js";

export const Match = model(matchModelName, matchSchema);
export const User = model(userModelName, UserSchema);
export const Alert = model(alertModelName, AlertSchema);
