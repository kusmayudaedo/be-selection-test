import { Router } from "express";
import { verifyUser } from "../../midlewares/index.js";

//@import controllers
import * as AttendaceController from "./index.js";

//@define route
const router = Router();

//@Authentication
router.post("/attendance/clock-in", verifyUser, AttendaceController.login);
router.post("/attendance/clock-out", verifyUser, AttendaceController.login);

export default router;
