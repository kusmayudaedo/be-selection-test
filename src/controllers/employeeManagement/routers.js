import { Router } from "express";
import path from "path";
import { verifyAdmin } from "../../midlewares/index.js";
import { createProfileUploader } from "../../helpers/uploader.js";

//@import controllers
import * as EmployeeControllers from "./index.js";

//@import uploader
const uploader = createProfileUploader(
  path.join(process.cwd(), "public", "images", "profiles")
);

//@define route
const router = Router();

//@Employee management
router.post(
  "/employee-management",
  verifyAdmin,
  uploader.fields([{ name: "data" }, { name: "file" }]),
  EmployeeControllers.register
);
router.get(
  "/employee-management",
  verifyAdmin,
  EmployeeControllers.getEmployeeInfo
);
export default router;
