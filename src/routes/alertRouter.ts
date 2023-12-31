import express from "express";
import alertController from "../controllers/alertController.js";
import { authJWT } from "../middleware/authJWT.js";

const router = express.Router();

router.get("/", alertController.getAlerts);
router.patch("/read/:alertId", alertController.readAlert);
router.delete("/remove", alertController.deleteAlerts);

export default router;
