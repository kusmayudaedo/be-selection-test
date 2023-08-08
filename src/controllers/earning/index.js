import User from "../../models/user.js";
import Attendance from "../../models/attendances.js";
import moment from "moment";
import { Op } from "sequelize";

export const getAllEarning = async (req, res, next) => {
  try {
    const { start, end, sort = "DESC" } = req.query;

    const employee = await User?.findOne({ where: { id: req.user.id } });
    if (!employee) throw { status: 400, message: error.USER_DOES_NOT_EXISTS };

    let queryOptions = {};
    console.log(!start, !end);

    if (!start || !end) {
      if (employee.id === 1) {
        console.log("admin not filter");
        queryOptions = {
          include: [
            {
              model: User,
              attributes: ["fullName", "username", "email", "salary"],
            },
          ],
          order: [["date", sort]],
        };
      } else {
        console.log("user not filter");
        queryOptions = {
          where: { employeeId: employee.id },
          include: [
            {
              model: User,
              attributes: ["fullName", "username", "email", "salary"],
            },
          ],
          order: [["date", sort]],
        };
      }
    } else {
      if (employee.id === 1) {
        console.log("admin filter");
        queryOptions = {
          where: { date: { [Op.between]: [start, end] } },
          include: [
            {
              model: User,
              attributes: ["fullName", "username", "email", "salary"],
            },
          ],
          order: [["date", sort]],
        };
      } else {
        console.log("user filter");
        queryOptions = {
          where: {
            employeeId: employee.id,
            date: { [Op.between]: [start, end] },
          },
          include: [
            {
              model: User,
              attributes: ["fullName", "username", "email", "salary"],
            },
          ],
          order: [["date", sort]],
        };
      }
    }

    const attendances = await Attendance.findAll(queryOptions);

    // Calculate total salary and construct the array with dailySalary
    const attendancesWithDailySalary = attendances.map((attendance) => {
      const { dailySalary, workingHours } = calculateDailySalary(
        attendance.clockIn,
        attendance.clockOut,
        attendance.user?.salary
      );
      const attendancePlainObject = attendance.get({ plain: true });
      return {
        ...attendancePlainObject,
        dailySalary,
        workingHours,
      };
    });

    let totalSalary = 0;
    attendancesWithDailySalary.forEach((attendance) => {
      totalSalary += attendance.dailySalary;
    });

    res.status(200).json({ result: attendancesWithDailySalary, totalSalary });
  } catch (error) {
    next(error);
  }
};

function calculateDailySalary(clockIn, clockOut, salary) {
  let workingHours;
  let dailySalary;
  const startTime = moment(clockIn);
  const endTime = moment(clockOut);

  if (clockIn == null || clockOut == null) {
    workingHours = 4;
    dailySalary = workingHours * salary;
  } else {
    workingHours = moment
      .duration(endTime.diff(startTime))
      .asHours()
      .toFixed(2);
    if (workingHours > 8) {
      dailySalary = 8 * salary;
    } else {
      dailySalary = workingHours * salary;
    }
  }

  return {
    dailySalary: Math.round(dailySalary),
    workingHours: workingHours,
  };
}
