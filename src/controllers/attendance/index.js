import User from "../../models/user.js";
import Attendance from "../../models/attendances.js";
import db from "../../models/index.js";

//@Clock In Action Controller
export const clockIn = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { date, clockIn } = req.body;

    //@Check if employee exists
    const employee = await User?.findOne({ where: { id: req.user.id } });
    if (!employee) throw { status: 400, message: error.USER_DOES_NOT_EXISTS };

    //@check if employee already clockin
    const validateAttendances = await Attendance.findOne({
      where: { date: date, employeeId: employee.id },
    });

    if (!validateAttendances) {
      await Attendance?.create({
        employeeId: employee.id,
        date: date,
        clockIn: clockIn,
      });
    } else {
      throw { status: 400, message: "User already Clock In" };
    }
    res.status(200).json({
      message: "Clock in successfully",
      clockIn: clockIn,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

//@Clock In Action Controller
export const clockOut = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { date, clockOut } = req.body;

    //@Check if employee exists
    const employee = await User?.findOne({ where: { id: req.user.id } });
    if (!employee) throw { status: 400, message: error.USER_DOES_NOT_EXISTS };

    const validateAttendances = await Attendance.findOne({
      where: { date: date, employeeId: employee.id },
    });

    if (!validateAttendances) {
      await Attendance.create({
        employeeId: employee.id,
        date: date,
        clockOut: clockOut,
      });
    } else {
      await Attendance.update(
        { clockOut: clockOut },
        { where: { date: date, employeeId: employee.id } }
      );
    }

    // if (validateAttendances.clockOut == null) {
    //   await Attendance.update(
    //     { clockOut: clockOut },
    //     { where: { date: date, employeeId: employee.id } }
    //   );
    // } else {
    //   throw { status: 400, message: "User already Clock Out" };
    // }

    res.status(200).json({
      message: "Clock Out successfully",
      clockOut: clockOut,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getAttandanceLog = async (req, res, next) => {
  try {
    const employee = await User?.findOne({ where: { id: req.user.id } });
    if (!employee) throw { status: 400, message: error.USER_DOES_NOT_EXISTS };

    let queryOptions = {};

    if (employee.id == 1) {
      console.log("admin");
      queryOptions = {
        include: [
          {
            model: User,
            attributes: ["fullName", "username", "email"],
          },
        ],
        order: [["date", "ASC"]],
      };
    } else {
      console.log("employee");
      queryOptions = {
        where: { employeeId: employee.id },
        include: [
          {
            model: User,
            attributes: ["fullName", "username", "email"],
          },
        ],
        order: [["date", "ASC"]],
      };
    }

    const log = await Attendance?.findAll(queryOptions);

    res.status(200).json({
      result: log,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;

    const employee = await User?.findOne({ where: { id: req.user.id } });
    if (!employee) throw { status: 400, message: error.USER_DOES_NOT_EXISTS };
    console.log(date);
    const log = await Attendance?.findAll({
      where: { employeeId: employee.id, date: date },
      include: [
        {
          model: User,
          attributes: ["fullName", "username", "email"],
        },
      ],
    });

    res.status(200).json({
      result: log,
    });
  } catch (error) {
    next(error);
  }
};
