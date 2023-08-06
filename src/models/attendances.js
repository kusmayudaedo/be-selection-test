import db from "./index.js";
import User from "./user.js";

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
      type: db.Sequelize.DATEONLY,
      allowNull: false,
    },
    clockIn: {
      type: db.Sequelize.DATE,
      allowNull: true,
    },
    clockOut: {
      type: db.Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

//Define relationships
User.hasMany(Attendance, { foreignKey: "employeeId" });
Attendance.belongsTo(User, { foreignKey: "employeeId" });

export default Attendance;
