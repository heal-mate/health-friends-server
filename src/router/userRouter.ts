import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import userController from "../controllers/userController.js";

const router = express.Router();

router.get("/", asyncHandler(userController.getUsers));

export default router;
