import express from "express";
import userController from "../controllers/userController.js";

const router = express.Router();

router.get("/recommend", userController.getUserRecommend);
router.get("/detail/:id", userController.getUser);

// 자기 정보 받아오기.
router.get("/mine", userController.getUserMine);
// 자기 정보 업데이트.
router.patch("/mine", userController.updateMe);

export default router;
