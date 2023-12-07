import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

// 인증메일 받기
router.post("/getAuthMail", authController.getAuthCode);
// 인증메일 확인
router.post("/CheckAuthMail", authController.checkAuthCode);
// 회원가입
router.post("/register", authController.registerUser);
// 로그인
router.post("/login", authController.loginUser);

export default router;
