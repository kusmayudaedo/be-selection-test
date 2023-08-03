import db from "./index.js";

//@define user models
const Attendance = db.sequelize.define(
  "attendances",
  {
    id: {
      type: db.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    employeeId: {
      type: db.Sequelize.INTEGER,
      allowNull: false,
    },
    date: {
      type: db.Sequelize.DATE,
      allowNull: false,
    },
    clockIn: {
      type: db.Sequelize.DATETIME,
      allowNull: true,
    },
    clockOut: {
      type: db.Sequelize.DATETIME,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

export default Attendance;
