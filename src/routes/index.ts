import express from "express";
import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import matchRouter from "./matchRouter.js";
import alertRouter from "./alertRouter.js";
import { authJWT } from "../middleware/authJWT.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/matches", authJWT, matchRouter);
router.use("/alerts", authJWT, alertRouter);

export default router;
