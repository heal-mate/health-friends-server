import { User } from "../models/index.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User as UserType } from "../models/schemas/user.js";

const secret: string = process.env.JWT_SECRET_KEY || "jwt-secret-key";

//accessToken 발급
const createAcessToken = (user: UserType) => {
  const payload = {
    _id: user._id,
    email: user.email,
    nickName: user.nickName,
    gender: user.gender,
    tel: user.tel,
    profileImageSrc: user.profileImageSrc,
    introduction: user.introduction,
  };
  return jwt.sign(payload, secret, { expiresIn: "1h" });
};

//token 검증
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return false;
  }
};

//refreshToken 발급
const createRefreshToken = (user: UserType) => {
  return jwt.sign({ _id: user._id }, secret, { expiresIn: "14d" });
};

//refreshToken 검증
const verifyRefreshtoken = async ({
  token,
  refreshDecodedUser,
}: {
  token: string;
  refreshDecodedUser: any;
}) => {
  const user = await User.findById(refreshDecodedUser?._id);
  try {
    if (user?.refreshToken === token) return { result: true, user };
    else return { result: false, user: null };
  } catch (error) {
    return { result: false, user: null };
  }
};

export {
  createAcessToken,
  verifyToken,
  createRefreshToken,
  verifyRefreshtoken,
};
