import { verifyToken } from "../helpers/token.js";

export async function verifyUser(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    req.user = verifyToken(token);
    req.body.userId = req.user?.id;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// @admin only middleware
export async function verifyAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = verifyToken(token);

    // @check if user is admin
    if (decoded?.role !== 1) throw { message: "Restricted" };

    next();
  } catch (error) {
    return res.status(403).json({ message: error?.message });
  }
}
