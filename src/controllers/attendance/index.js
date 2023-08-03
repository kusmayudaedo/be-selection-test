import User from "../../models/user.js";

//@Clock In Action Controller
export const clockIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = helpers.verifyToken(token);
    //@update isVerified field to 1
    await User?.update({ status: 1 }, { where: { id: decodedToken?.id } });
    // @return response
    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    next(error);
  }
};

//@Clock In Action Controller
export const clockOut = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = helpers.verifyToken(token);
    //@update isVerified field to 1
    await User?.update({ status: 1 }, { where: { id: decodedToken?.id } });
    // @return response
    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    next(error);
  }
};
