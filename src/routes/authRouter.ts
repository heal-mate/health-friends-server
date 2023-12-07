import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

// 유저에게 인증메일 보내기
router.post("/auth-mail", authController.authCode);
// 유저가 메일로 받은 코드 유효성 확인
router.post("/check-auth-mail", authController.checkAuthCode);
// 회원가입
router.post("/register", authController.registerUser);
// 로그인
router.post("/login", authController.loginUser);

router.get("/logout", authController.logoutUser);

export default router;
