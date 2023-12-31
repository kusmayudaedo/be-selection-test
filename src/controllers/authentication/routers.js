import { Router } from "express";
import { verifyUser } from "../../midlewares/index.js";

//@import controllers
import * as AuthControllers from "./index.js";

//@define route
const router = Router();

//@Authentication
router.post("/auth/login", AuthControllers.login);
router.get("/auth", AuthControllers.keepLogin);
router.patch("/auth/verify/", verifyUser, AuthControllers.verifyAccount);
router.patch(
  "/auth/change-password",
  verifyUser,
  AuthControllers.changePassword
);
router.put("/auth/forget-password", AuthControllers.forgetPassword);
router.patch("/auth/reset-password", AuthControllers.ressetPassword);

export default router;
