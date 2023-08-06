import { Router } from "express";
import { verifyUser } from "../../midlewares/index.js";

//@import controllers
import * as AttendaceController from "./index.js";

//@define route
const router = Router();

//@Authentication
router.patch("/attendance/clock-in", verifyUser, AttendaceController.clockIn);
router.patch("/attendance/clock-out", verifyUser, AttendaceController.clockOut);
router.get("/attendance", verifyUser, AttendaceController.getAttendance);
router.get("/attendance/log", verifyUser, AttendaceController.getAttandanceLog);

export default router;
