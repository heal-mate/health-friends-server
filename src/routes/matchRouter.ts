import express from "express";
import matchController from "../controllers/matchController.js";

const router = express.Router();

router.get("/received", matchController.getMatchesReceived);
router.get("/sent", matchController.getMatchesSent);
router.post("/request", matchController.requestMatch);
router.delete("/cancel/:matchId", matchController.cancelMatch);
router.patch("/accept/:matchId", matchController.acceptMatch);
router.patch("/reject/:matchId", matchController.rejectMatch);

export default router;
