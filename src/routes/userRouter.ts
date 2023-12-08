import express from "express";
import userController from "../controllers/userController.js";
import { authJWT } from "../middleware/authJWT.js";

const router = express.Router();

router.get("/recommend", authJWT, userController.getUserRecommend);
router.get("/detail/:id", authJWT, userController.getUser);

// 필터 조건 변경
router.patch("/conditionExpect", authJWT, userController.updateConditionExpect);
// 자기 정보 받아오기.
router.get("/mine", authJWT, userController.getUserMine);
// 자기 정보 업데이트.
router.patch("/mine", authJWT, userController.updateMe);
// 인증메일 받기
router.post("/getAuthMail", userController.getAuthCode);
// 인증메일 확인
router.post("/CheckAuthMail", userController.checkAuthCode);
// 회원가입
router.post("/register", userController.registerUser);
// 로그인
router.post("/login", userController.loginUser);
// 유효한 유저인지 확인
router.post("/validUser", authJWT, userController.isValidUser);

// 웹 푸시 토큰 등록
router.post("/webpush-token", authJWT, userController.registerWebPushToken);

export default router;
