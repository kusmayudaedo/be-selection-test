import User from "../../models/user.js";
import * as helpers from "../../helpers/index.js";
import * as Validation from "./validation.js";
import * as config from "../../config/index.js";
import { ValidationError } from "yup";
import * as error from "../../midlewares/error.handler.js";
import db from "../../models/index.js";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

//@register employee controller
export const register = async (req, res, next) => {
  //@Sequelize transaction
  const transaction = await db.sequelize.transaction();
  const profileImg = req?.files?.["file"][0].filename;
  try {
    const { data } = req.body;
    const body = JSON.parse(data);
    await Validation.RegisterValidationSchema.validate(body);

    //@check if user is already registered
    const employeeExist = await User?.findOne({
      where: { username: body.username, email: body.email },
    });
    if (employeeExist)
      throw { status: 400, message: error.USER_ALREADY_EXISTS };

    //Give a employee default password
    const defaultPassword = helpers.generateDefaultPassword();
    console.log(defaultPassword);

    //@encrypt user default password using bcrypt
    const encryptedPassword = helpers.hashPassword(defaultPassword);
    const employee = await User.create({
      fullName: body.fullName,
      username: body.username,
      email: body.email,
      phone: body.phone,
      password: encryptedPassword,
      salary: parseInt(body.salary),
      profileImg: "public/images/profiles/" + profileImg,
    });

    //@delete data password before sending response
    delete employee?.dataValues?.password;

    //@generate access token
    const accessToken = helpers.createToken({
      id: employee?.dataValues?.id,
      role: employee?.dataValues?.role,
    });

    //@Send verification link via email
    const template = fs.readFileSync(
      path.join(process.cwd(), "templates", "registerEmployee.html"),
      "utf8"
    );
    const message = handlebars.compile(template)({
      fullName: body.fullName,
      username: body.username,
      defaultPassword,
      link: config.REDIRECT_URL + `/auth/change-password/${accessToken}`,
    });

    const mailOptions = {
      from: config.GMAIL,
      to: body.email,
      subject: "Welcome to Tokopaedi",
      html: message,
    };

    helpers.transporter.sendMail(mailOptions, (error, info) => {
      if (error) throw error;
      console.log(`Email sent : ${info.response}`);
    });

    //@send response
    res
      .header("Authorization", `Bearer ${accessToken}`)
      .status(200)
      .json({ message: "Register successful", data: employee });

    // @commit transaction
    await transaction.commit();
  } catch (error) {
    // @rollback transaction
    await transaction.rollback();

    // @check if error from validation
    if (error instanceof ValidationError) {
      return next({ status: 400, message: error?.errors?.[0] });
    }
    next(error);
  }
};

//@Change status employee
export const changeStatusEmployee = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.query;

    //@Check if employee exists
    const employee = await User?.findOne({ where: { id: id } });
    if (!employee) throw { status: 400, message: error.USER_DOES_NOT_EXISTS };

    //@update status to 2 (inactive employee)
    await User?.update({ status: status }, { where: { id: id } });
    res.status(200).json({ message: "Employee status changed" });

    //@Send notification via email
    let templateEmail = "";
    let subject = "";
    if (status == 1) {
      templateEmail = "activationAccount.html";
      subject = "Re-Activate Account";
    } else {
      templateEmail = "deactivateAccount.html";
      subject = "Deactivate Account";
    }
    const template = fs.readFileSync(
      path.join(process.cwd(), "templates", templateEmail),
      "utf8"
    );
    const message = handlebars.compile(template)({
      fullName: employee?.dataValues?.fullName,
    });

    const mailOptions = {
      from: config.GMAIL,
      to: employee?.dataValues?.email,
      subject: subject,
      html: message,
    };

    helpers.transporter.sendMail(mailOptions, (error, info) => {
      if (error) throw error;
      console.log(`Email sent : ${info.response}`);
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

//@get employee info
export const getEmployeeInfo = async (req, res, next) => {
  try {
    //@get query params
    const { sort, page = 1, status } = req.query;

    //@pagination
    const pageSize = 5;
    let offset = 0;
    let limit = pageSize;
    let currentPage = 1;

    if (page && !isNaN(page)) {
      currentPage = page;
      offset = (currentPage - 1) * pageSize;
    }

    let queryOptions = {};
    console.log("status : " + status);

    if (!status) {
      queryOptions = {
        where: { role: 2 },
        order: [["fullName", sort]],
        offset,
        limit,
      };
    } else {
      queryOptions = {
        where: { role: 2, status: status },
        order: [["fullName", sort]],
        offset,
        limit,
      };
    }
    //@get employee info
    const { count, rows: users } = await User.findAndCountAll(queryOptions);

    const totalPages = Math.ceil(count / pageSize);

    //@delete password information
    delete users[0]?.dataValues?.password;

    res.status(200).json({
      totalEmployee: count,
      employeeLimit: limit,
      totalPages: totalPages,
      currentPage: parseInt(currentPage),
      result: users,
    });
  } catch (error) {
    next(error);
  }
};

//@update profile employee
export const updateProfile = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { fullName, username, email, phone } = req.body;

    //@Check if employee exists
    const employee = await User?.findOne({ where: { id: id } });
    if (!employee) throw { status: 400, message: error.USER_DOES_NOT_EXISTS };

    await User?.update(
      { fullName: fullName, username: username, email: email, phone: phone },
      { where: { id: id } }
    );
    res
      .status(200)
      .json({ message: "Profile change successfully", data: employee });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
