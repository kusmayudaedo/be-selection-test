import User from "../../models/user.js";
import Attendance from "../../models/attendances.js";
import moment from "moment";

export const getAllEarning = async (req, res, next) => {
  try {
    const { id, sort = "ASC" } = req.query;
    let queryOptions = {};

    if (!id) {
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
      queryOptions = {
        where: { employeeId: id },
        include: [
          {
            model: User,
            attributes: ["fullName", "username", "email", "salary"],
          },
        ],
        order: [["date", sort]],
      };
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
