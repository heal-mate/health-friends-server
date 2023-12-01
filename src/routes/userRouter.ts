import express from "express";
import userController from "../controllers/userController.js";

const router = express.Router();

router.get("/recommend", userController.getUserRecommend);
router.get("/detail/:id", userController.getUser);

router.patch("/conditionExpect", userController.updateConditionExpect);

export default router;
