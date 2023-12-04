import express from "express";
import userController from "../controllers/userController.js";
import { authJWT } from "../middleware/authJWT.js";

const router = express.Router();

router.get("/recommend", userController.getUserRecommend);
router.get("/detail/:id", userController.getUser);

// 필터 조건 변경
router.patch("/conditionExpect", userController.updateConditionExpect);
// 자기 정보 받아오기.
router.get("/mine", authJWT, userController.getUserMine);
// 자기 정보 업데이트.
router.patch("/mine", userController.updateMe);
// 인증메일 받기
router.post("/getAuthMail", userController.getAuthCode);
// 인증메일 확인
router.post("/CheckAuthMail", userController.checkAuthCode);
// 회원가입
router.post("/register", userController.registerUser);
// 로그인
router.post("/login", userController.loginUser);

export default router;
