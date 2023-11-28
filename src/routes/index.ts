import express from "express";
import userRouter from "./userRouter.js";
import matchRouter from "./matchRouter.js";

const router = express.Router();

router.use("/users", userRouter);
router.use("/matches", matchRouter);

export default router;
