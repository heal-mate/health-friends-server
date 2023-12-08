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

// 웹 푸시 토큰 등록
router.post("/webpush-token", authJWT, userController.registerWebPushToken);

export default router;
