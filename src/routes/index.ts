import express from "express";
import userRouter from "./userRouter.js";
import matchRouter from "./matchRouter.js";
import alertRouter from "./alertRouter.js";

const router = express.Router();

router.use("/users", userRouter);
router.use("/matches", matchRouter);
router.use("/alerts", alertRouter);

export default router;
