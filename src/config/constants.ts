export const LOCATION = [
  "잠실",
  "송파",
  "성수",
  "삼성",
  "청담",
  "역삼",
  "대치",
  "개포",
  "강남",
] as const;

export const GENDER = ["MALE", "FEMALE"] as const;

export const matchStatusDict = {
  waiting: "WAITING",
  rejected: "REJECTED",
  accepted: "ACCEPTED",
} as const;

export const MATCH_STATUS = Object.values(matchStatusDict);

export type MatchStatus = (typeof MATCH_STATUS)[number];

export const MAX_EXPIRY_MINUTE = 5;
