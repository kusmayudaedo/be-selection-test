import User from "../../models/user.js";
import Attendance from "../../models/attendances.js";
import db from "../../models/index.js";
import { Op } from "sequelize";

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
    } else if (validateAttendances.dataValues.clockOut !== null) {
      throw { status: 400, message: "Clock in Error" };
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

    // console.log(validateAttendances);

    if (!validateAttendances) {
      await Attendance.create({
        employeeId: employee.id,
        date: date,
        clockOut: clockOut,
      });
    } else if (validateAttendances?.dataValues.clockOut === null) {
      await Attendance.update(
        { clockOut: clockOut },
        { where: { date: date, employeeId: employee.id } }
      );
    } else {
      throw { status: 400, message: "User already Clock Out" };
    }

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
        order: [["date", "DESC"]],
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
        order: [["date", "DESC"]],
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
    const { start, end } = req.query;

    const employee = await User?.findOne({ where: { id: req.user.id } });
    if (!employee) throw { status: 400, message: error.USER_DOES_NOT_EXISTS };

    let queryOptions = {};

    if (employee.id === 1) {
      queryOptions = {
        where: { date: { [Op.between]: [start, end] } },
        include: [
          {
            model: User,
            attributes: ["fullName", "username", "email"],
          },
        ],
      };
    } else {
      queryOptions = {
        where: {
          employeeId: employee.id,
          date: { [Op.between]: [start, end] },
        },
        include: [
          {
            model: User,
            attributes: ["fullName", "username", "email"],
          },
        ],
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
