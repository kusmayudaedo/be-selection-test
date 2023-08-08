import moment from "moment";
import mysql from "mysql2";

// Create a connection to your MySQL database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "selectiontest",
});

function generateDummyAttendanceData() {
  const startDate = moment("2023-07-01", "YYYY-MM-DD");
  const endDate = moment("2023-07-31", "YYYY-MM-DD");
  const dummyData = [];

  let currentId = 1;
  let currentDate = startDate.clone();
  while (currentDate.isSameOrBefore(endDate)) {
    const employeeId = Math.floor(Math.random() * (4 - 2 + 1)) + 2;
    const date = currentDate.format("YYYY-MM-DD");
    const clockInHour = Math.floor(Math.random() * (10 - 7 + 1)) + 7;
    const clockOutHour = Math.floor(Math.random() * (20 - 17 + 1)) + 17;

    const clockIn = currentDate
      .hour(clockInHour)
      .minute(Math.floor(Math.random() * (45 - 5 + 1)) + 5)
      .second(Math.floor(Math.random() * (45 - 5 + 1)) + 5)
      .format("YYYY-MM-DD HH:mm:ss");
    const clockOut = currentDate
      .hour(clockOutHour)
      .minute(Math.floor(Math.random() * (45 - 5 + 1)) + 5)
      .second(Math.floor(Math.random() * (45 - 5 + 1)) + 5)
      .format("YYYY-MM-DD HH:mm:ss");

    dummyData.push({ id: currentId, employeeId, date, clockIn, clockOut });

    currentDate.add(1, "day");
    currentId++;
  }

  return dummyData;
}

// Generate dummy attendance data for July 2023
const dummyAttendanceData = generateDummyAttendanceData();

console.log(dummyAttendanceData);

// Prepare the SQL INSERT statements
const insertStatements = dummyAttendanceData.map((attendance) => {
  const { id, employeeId, date, clockIn, clockOut } = attendance;
  return `INSERT INTO attendances (id, employeeId, date, clockIn, clockOut)
          VALUES (${id}, ${employeeId}, '${date}', '${clockIn}', '${clockOut}')`;
});

// Connect to the database and run the INSERT statements
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }

  insertStatements.forEach((sql) => {
    connection.query(sql, (error, results, fields) => {
      if (error) {
        console.error("Error executing SQL:", error);
      } else {
        console.log("Data inserted successfully:", results);
      }
    });
  });

  // Close the connection
  connection.end();
});
