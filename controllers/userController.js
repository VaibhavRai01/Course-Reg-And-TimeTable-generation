const User = require("../models/userModel");
const Course = require("../models/coursemodel");
const Othercourse = require("../models/othercourse");
const Programcourse = require("../models/programcourse");
const Facultycourse = require("../models/facultycourse");
const Coursereg = require("../models/coursereg");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const randomstring = require("randomstring");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const sendVerifyMail = async (name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "Verification Mail",
      html:
        "<p>Hello " +
        name +
        ' click here to <a href="https://course-reg-lnm.onrender.com/verify?id=' +
        user_id +
        '"> verify</a> your mail. </p>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email sent", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//for reset password mail

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "Reset Password",
      html:
        "<p>Hello " +
        name +
        ' click here to <a href="https://course-reg-lnm.onrender.com/forget-password?token=' +
        token +
        '"> Reset </a> your password. </p>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email sent", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    var roll = await req.body.rollno.toLowerCase();
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      rollno: roll,
      branch: req.body.branch,
      semester: req.body.semester,
      password: spassword,
      is_admin: 0,
    });
    const userd = await User.findOne({ email: req.body.email });
    if (userd) {
      res.render("registration", { message: "Already Registered" });
    } else {
      // console.log(req.body.email.length);
      if (req.body.email.length != 21) {
        res.render("registration", { message: "Invalid email" });
      } else {
        var s1 = await req.body.email.substring(0, 8);
        var s2 = await req.body.email.substring(8, 21);
        // console.log(s1);
        // console.log(s2);
        const bool1 = await s1.localeCompare(roll);
        const bool2 = await s2.localeCompare("@lnmiit.ac.in");
        if (bool1 !== 0) {
          res.render("registration", {
            message: "Email and roll number does not match",
          });
        } else {
          if (bool2 != 0) {
            res.render("registration", { message: "invalid mail domain" });
          } else {
            const userData = await user.save();
            if (userData) {
              sendVerifyMail(req.body.name, req.body.email, userData._id);
              res.render("registration", {
                message: "Registration successful.  Verify your mail",
              });
            } else {
              res.render("registration", { message: "Registration failed." });
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_varified: 1 } }
    );
    console.log(updateInfo);
    res.render("email-verified");
  } catch (error) {
    console.log(error.message);
  }
};

const profileLoad = async (req, res) => {
  try {
    const userData1 = await User.findOne({ _id: req.session.user_id });
    const userData2 = await Leaderboard.findOne({ email: userData1.email });

    res.render("profile", { user: userData1, leaderboard: userData2 });
  } catch (error) {
    console.log(error.message);
  }
};

const courseregLoad = async (req, res) => {
  try {
    const userData1 = await User.findOne({ _id: req.session.user_id });
    const userData2 = await Coursereg.findOne({ rollno: userData1.rollno });

    const coursedata1 = await Course.find({
      semester: parseInt(userData1.semester),
      branch: userData1.branch,
    });
    const coursedata2 = await Programcourse.find({
      semester: parseInt(userData1.semester),
      branch: userData1.branch,
    });
    const coursedata3 = await Othercourse.find({
      semester: parseInt(userData1.semester),
      branch: userData1.branch,
    });
    if (userData2) {
      res.render("home", {
        message: "you have done the course registration",
        user: userData1,
        coursereg: userData2.corecourses,
        coursereg2: userData2.programcourses,
      });
    } else {
      res.render("coursereg", {
        user: userData1,
        corecourse: coursedata1,
        programcourse: coursedata2,
        othercourse: coursedata3,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const coursereg = async (req, res) => {
  try {
    const userData1 = await User.findOne({ _id: req.session.user_id });
    // console.log(userData1.branch);
    const coursedata1 = await Course.find({
      semester: parseInt(userData1.semester),
      branch: userData1.branch,
    });
    const coursedata2 = await Programcourse.find({
      semester: parseInt(userData1.semester),
      branch: userData1.branch,
    });
    const coursedata3 = await Othercourse.find({
      semester: parseInt(userData1.semester),
      branch: userData1.branch,
    });
    const d = await Coursereg.findOne({ rollno: userData1.rollno });
    if (d) {
      res.render("coursereg", {
        message: "Already Registered",
        user: userData1,
        corecourse: coursedata1,
        programcourse: coursedata2,
        othercourse: coursedata3,
      });
    } else {
      // console.log(coursedata1);
      // console.log(req.body.coreCourses);
      if (
        req.body.programCourses !== undefined &&
        req.body.programCourses.length > 3
      ) {
        res.render("coursereg", {
          message: "Course Limit Exceeded",
          user: userData1,
          corecourse: coursedata1,
          programcourse: coursedata2,
          othercourse: coursedata3,
        });
      } else {
        if (
          req.body.coreCourses === undefined ||
          req.body.coreCourses.length < coursedata1.length
        ) {
          res.render("coursereg", {
            message: "select all core courses",
            user: userData1,
            corecourse: coursedata1,
            programcourse: coursedata2,
            othercourse: coursedata3,
          });
        } else {
          const coursereg = new Coursereg({
            name: userData1.name,
            rollno: userData1.rollno,
            corecourses: req.body.coreCourses,
            programcourses: req.body.programCourses,
            othercourses: req.body.otherCourses,
          });

          const userData = await coursereg.save();
          res.render("coursereg", {
            message: "registration successful",
            user: userData1,
            corecourse: coursedata1,
            programcourse: coursedata2,
            othercourse: coursedata3,
          });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loginLoad = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_varified === 0) {
          res.render("login", { message: "Please verify your mail." });
        } else {
          req.session.user_id = userData._id;
          if (userData.is_faculty == 0) {
            res.redirect("/home");
          } else {
            res.redirect("/facultyhome");
          }
        }
      } else {
        res.render("login", { message: "Email and password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email and password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadHome = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    const userData2 = await Coursereg.findOne({ rollno: userData.rollno });
    // console.log(userData2);
    if (userData.is_faculty == 1) {
      res.redirect("/facultyhome");
    } else {
      if (userData2) {
        res.render("home", {
          user: userData,
          coursereg: userData2.corecourses,
          coursereg2: userData2.programcourses,
        });
      } else {
        res.render("home", { user: userData, coursereg: {}, coursereg2: {} });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadfacultyHome = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    const userData2 = await Facultycourse.findOne({ email: userData.email });
    // console.log(userData2);if(userData2){
    if (userData2) {
      res.render("facultyhome", {
        user: userData,
        coursereg: userData2.courses,
      });
    } else {
      res.render("facultyhome", {
        user: userData,
        coursereg: {},
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

//forget password code starts

const forgetLoad = async (req, res) => {
  try {
    res.render("forget");
  } catch (error) {
    console.log(error.message);
  }
};

const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const randomString = randomstring.generate();
      const updatedData = await User.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetPasswordMail(userData.name, userData.email, randomString);
      res.render("forget", {
        message: "Please check your mail to reset your password.",
      });
    } else {
      res.render("forget", { message: "User email not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      res.render("forget-password", { user_id: tokenData._id });
    } else {
      res.render("404", { message: "Token is invalid." });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;

    const secure_password = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_password, token: "" } }
    );
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

//for verification mail send link

const verificationLink = async (req, res) => {
  try {
    res.render("verification");
  } catch (error) {
    console.log(error.message);
  }
};

const sendVerificationLink = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      sendVerifyMail(userData.name, userData.email, userData._id);
      res.render("verification", {
        message: "Verification link sent on your mail, please check",
      });
    } else {
      res.render("verification", { message: "This email does not exist" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const ttgenLoad = async (req, res) => {
  try {
    const userData1 = await User.findById({ _id: req.session.user_id });
    const coursedata1 = await Course.find();
    const coursedata2 = await Programcourse.find();
    const coursedata3 = await Othercourse.find();
    const coursedata4 = await Facultycourse.find();

    res.render("ttgen", {
      admin: userData1,
      corecourse: coursedata1,
      programcourse: coursedata2,
      othercourse: coursedata3,
      facultycourse: coursedata4,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const ttgenLoady20 = async (req, res) => {
  try {
    const userData1 = await User.findById({ _id: req.session.user_id });
    const coursedata11 = await Course.find({ branch: "CSE", semester: 8 });
    const coursedata12 = await Course.find({ branch: "ECE", semester: 8 });
    const coursedata13 = await Course.find({ branch: "CCE", semester: 8 });
    const coursedata14 = await Course.find({ branch: "MME", semester: 8 });
    // console.log(course)
    const coursedata21 = await Programcourse.find({
      branch: "CSE",
      semester: 8,
    });
    const coursedata22 = await Programcourse.find({
      branch: "ECE",
      semester: 8,
    });
    const coursedata23 = await Programcourse.find({
      branch: "CCE",
      semester: 8,
    });
    const coursedata24 = await Programcourse.find({
      branch: "MME",
      semester: 8,
    });
    // const coursedata2= await Programcourse.find();
    const coursedata3 = await Othercourse.find();
    const coursedata4 = await Facultycourse.find();

    res.render("ttgeny20", {
      admin: userData1,
      corecoursecse: coursedata11,
      corecourseece: coursedata12,
      corecourseme: coursedata14,
      corecoursecce: coursedata13,
      programcoursecse: coursedata21,
      programcoursecce: coursedata22,
      programcourseece: coursedata23,
      programcourseme: coursedata24,
      othercourse: coursedata3,
      facultycourse: coursedata4,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const ttgenLoady21 = async (req, res) => {
  try {
    const userData1 = await User.findById({ _id: req.session.user_id });
    const coursedata11 = await Course.find({ branch: "CSE", semester: 6 });
    const coursedata12 = await Course.find({ branch: "ECE", semester: 6 });
    const coursedata13 = await Course.find({ branch: "CCE", semester: 6 });
    const coursedata14 = await Course.find({ branch: "MME", semester: 6 });
    // console.log(course)
    const coursedata21 = await Programcourse.find({
      branch: "CSE",
      semester: 6,
    });
    const coursedata22 = await Programcourse.find({
      branch: "ECE",
      semester: 6,
    });
    const coursedata23 = await Programcourse.find({
      branch: "CCE",
      semester: 6,
    });
    const coursedata24 = await Programcourse.find({
      branch: "MME",
      semester: 6,
    });
    // const coursedata2= await Programcourse.find();
    const coursedata3 = await Othercourse.find();
    const coursedata4 = await Facultycourse.find();

    res.render("ttgeny21", {
      admin: userData1,
      corecoursecse: coursedata11,
      corecourseece: coursedata12,
      corecourseme: coursedata14,
      corecoursecce: coursedata13,
      programcoursecse: coursedata21,
      programcoursecce: coursedata22,
      programcourseece: coursedata23,
      programcourseme: coursedata24,
      othercourse: coursedata3,
      facultycourse: coursedata4,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const ttgenLoady22 = async (req, res) => {
  try {
    const userData1 = await User.findById({ _id: req.session.user_id });
    const coursedata11 = await Course.find({ branch: "CSE", semester: 4 });
    const coursedata12 = await Course.find({ branch: "ECE", semester: 4 });
    const coursedata13 = await Course.find({ branch: "CCE", semester: 4 });
    const coursedata14 = await Course.find({ branch: "MME", semester: 4 });
    // console.log(course)
    const coursedata21 = await Programcourse.find({
      branch: "CSE",
      semester: 4,
    });
    const coursedata22 = await Programcourse.find({
      branch: "ECE",
      semester: 4,
    });
    const coursedata23 = await Programcourse.find({
      branch: "CCE",
      semester: 4,
    });
    const coursedata24 = await Programcourse.find({
      branch: "MME",
      semester: 4,
    });
    // const coursedata2= await Programcourse.find();
    const coursedata3 = await Othercourse.find();
    const coursedata4 = await Facultycourse.find();

    res.render("ttgeny22", {
      admin: userData1,
      corecoursecse: coursedata11,
      corecourseece: coursedata12,
      corecourseme: coursedata14,
      corecoursecce: coursedata13,
      programcoursecse: coursedata21,
      programcoursecce: coursedata22,
      programcourseece: coursedata23,
      programcourseme: coursedata24,
      othercourse: coursedata3,
      facultycourse: coursedata4,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const ttgenLoady23 = async (req, res) => {
  try {
    const userData1 = await User.findById({ _id: req.session.user_id });
    const coursedata11 = await Course.find({ branch: "CSE", semester: 2 });
    const coursedata12 = await Course.find({ branch: "ECE", semester: 2 });
    const coursedata13 = await Course.find({ branch: "CCE", semester: 2 });
    const coursedata14 = await Course.find({ branch: "MME", semester: 2 });
    const coursedata21 = await Programcourse.find({
      branch: "CSE",
      semester: 2,
    });
    const coursedata22 = await Programcourse.find({
      branch: "ECE",
      semester: 2,
    });
    const coursedata23 = await Programcourse.find({
      branch: "CCE",
      semester: 2,
    });
    const coursedata24 = await Programcourse.find({
      branch: "MME",
      semester: 2,
    });
    // const coursedata2= await Programcourse.find();
    const coursedata3 = await Othercourse.find();
    const coursedata4 = await Facultycourse.find();

    res.render("ttgeny23", {
      admin: userData1,
      corecoursecse: coursedata11,
      corecourseece: coursedata12,
      corecourseme: coursedata14,
      corecoursecce: coursedata13,
      programcoursecse: coursedata21,
      programcoursecce: coursedata22,
      programcourseece: coursedata23,
      programcourseme: coursedata24,
      othercourse: coursedata3,
      facultycourse: coursedata4,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const editLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    const userData2 = await Leaderboard.findOne({ email: userData.email });

    if (userData) {
      res.render("edit", { user: userData, leaderboard: userData2 });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loaddevelop = async (req, res) => {
  try {
      res.render("developedBy");
    
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  verifyMail,
  loginLoad,
  verifyLogin,
  loadHome,
  loadfacultyHome,
  userLogout,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  verificationLink,
  sendVerificationLink,
  editLoad,
  profileLoad,
  courseregLoad,
  coursereg,
  ttgenLoad,
  ttgenLoady20,
  ttgenLoady21,
  ttgenLoady22,
  ttgenLoady23,
  loaddevelop,
};
