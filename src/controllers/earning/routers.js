import { Router } from "express";
import { verifyAdmin, verifyUser } from "../../midlewares/index.js";

//@import controllers
import * as EarningControllers from "./index.js";

//@define route
const router = Router();

//@Authentication
router.get("/balance", verifyUser, EarningControllers.getAllEarning);

export default router;
