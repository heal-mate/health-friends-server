import { model } from "mongoose";
import { matchSchema, MATCH_MODEL_NAME } from "./schemas/match.js";
import { UserSchema, USER_MODEL_NAME } from "./schemas/user.js";
import { AlertSchema, ALERT_MODEL_NAME } from "./schemas/alert.js";

export const Match = model(MATCH_MODEL_NAME, matchSchema);
export const User = model(USER_MODEL_NAME, UserSchema);
export const Alert = model(ALERT_MODEL_NAME, AlertSchema);
