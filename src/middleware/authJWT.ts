import {
  verifyToken,
  verifyRefreshtoken,
  createAcessToken,
} from "../utils/jwt.js";
import { asyncHandler } from "./asyncHandler.js";

type ErrorType = {
  status?: number;
  message?: string;
};
const authJWT = asyncHandler(async (req, res) => {
  const accessToken = req.cookies?.accessToken; //쿠키에서 엑세스토큰 획득
  const refreshToken = req.cookies?.refreshToken; //쿠키에서 리프레시토큰 획득

  // 쿠키에 accessToken이 없을 경우 (재 로그인)
  if (!accessToken) {
    const error: ErrorType = new Error(
      "Access Token이 존재하지 않습니다. 재 로그인 해주세요.",
    );
    error.status = 401; //유효하지 않는 인증자격
    throw error;
  }

  // accessToken 검증
  const accessDecodedUser = verifyToken(accessToken);
  if (accessDecodedUser) {
    // 토큰 검증이 성공적으로 완료되면 토큰에 담긴 값을 이후 request handler에서도 사용할수 있도록 임시 저장소인 res.locals에 등록
    // 이렇게 등록을 해놓으면 이후의 crud에서도 토큰에 담긴 유저 정보를 사용할 수 있다.
    res.locals.userInfo = accessDecodedUser;
    return;
  }

  // accessToken검증에 실패하거나 만료되었다면 refreshToken 확인
  // 쿠키에 refreshToken이 없을 경우 (재 로그인)
  if (!refreshToken) {
    const error: ErrorType = new Error(
      "Refresh Token이 존재하지 않습니다. 재 로그인 해주세요.",
    );
    error.status = 401;
    throw error;
  }

  // refreshToekn 검증
  const refreshDecodedUser: any = verifyToken(refreshToken);
  // user테이블의 refreshToken과 동일한지 검증

  const { result, user } = await verifyRefreshtoken({
    token: refreshToken,
    refreshDecodedUser,
  });

  //refreshToken이 만료되었다면(재 로그인)
  if (!refreshDecodedUser) {
    const error: ErrorType = new Error(
      "Refresh Token이 만료되었습니다. 재 로그인 해주세요.",
    );
    error.status = 419;
    throw error;
  }

  //user테이블의 refreshToken이 동일하지 않다면
  if (!result) {
    const error: ErrorType = new Error(
      "Refresh Token의 정보가 서버에 존재하지 않습니다.",
    );
    error.status = 419; //POST 전송시 CSRF 토큰이 누락되거나 맞지 않아서 발생하는 오류
    throw error;
  }

  //refreshToken 검증이 모두 통과된다면
  if (refreshDecodedUser && result && user) {
    const newAccessToken = createAcessToken(user);
    res.cookie("accessToken", newAccessToken);
    res.locals.userInfo = user;
    return;
  }
});

export { authJWT };
