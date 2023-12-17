const User = require("../models/userModel");
const Course = require("../models/coursemodel");
const Othercourse = require("../models/othercourse");
const Programcourse = require("../models/programcourse");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const config = require("../config/config");
const Facultycourse = require("../models/facultycourse");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const addUserMail = async (name, email, password, user_id) => {
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
      subject: "Admin add you and verify your mail",
      html:
        "<p>Hello " +
        name +
        ' click here to <a href="https://course-reg-lnm.onrender.com/verify?id=' +
        user_id +
        '"> verify</a> your mail. </p> <br><br> <b>Email- </b> ' +
        email +
        " <br><b>Password -</b>" +
        password +
        "",
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

const loadLogin = async (req, res) => {
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
        if (userData.is_admin === 0) {
          res.render("login", { message: "invalid mail or passwrord" });
        } else {
          req.session.user_id = userData._id;
          res.redirect("/admin/home");
        }
      } else {
        res.render("login", { message: "invalid mail or password" });
      }
    } else {
      res.render("login", { message: "invalid mail or password" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadDashboard = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    if (userData.is_admin == 0) {
      res.render("404", { message: "you are not admin" });
    } else {
      res.render("home", { admin: userData });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

//New users add

const newUserLoad = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    if (userData.is_admin == 0) {
      res.render("404", { message: "you are not an admin" });
    } else {
      res.render("new-user");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const rollno = req.body.rollno;
    const semester = req.body.semester;
    const branch = req.body.branch;
    const password = randomstring.generate(8);
    const spassword = await securePassword(password);
    const user = new User({
      name: name,
      rollno: rollno,
      email: email,
      semester: semester,
      branch: branch,
      password: spassword,
      is_admin: 0,
      is_varified: 1,
      is_faculty: 0,
    });

    const userData = await user.save();

    if (userData) {
      res.redirect("/admin/home");
    } else {
      res.render("new-user", { message: "Something wrong" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const newFacultyLoad = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    if (userData.is_admin == 0) {
      res.render("404", { message: "you are not an admin" });
    } else {
      res.render("new-faculty");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addFaculty = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = randomstring.generate(8);
    const spassword = await securePassword(password);
    const user = new User({
      name: name,
      rollno: ".",
      email: email,
      semester: ".",
      branch: ".",
      password: spassword,
      is_admin: 0,
      is_varified: 1,
      is_faculty: 1,
    });

    const userData = await user.save();

    if (userData) {
      res.redirect("/admin/home");
    } else {
      res.render("new-faculty", { message: "Something wrong" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addcourseLoad = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    const courseData = await Course.find();
    const courseData2 = await Programcourse.find();
    const courseData3 = await Othercourse.find();
    if (userData.is_admin == 0) {
      res.render("404", { message: "you are not an admin" });
    } else {
      res.render("course", {
        admin: userData,
        course: courseData,
        program: courseData2,
        other: courseData3,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addcourse = async (req, res) => {
  try {
    const index = req.body.index;
    const name = req.body.name;
    const sem = req.body.semester;
    const branch = req.body.branch;
    const type = req.body.courseType;
    if (type === "core") {
      const course = new Course({
        coursename: name,
        courseid: index,
        semester: sem,
        branch: branch,
      });
      const courseData1 = await course.save();
      const courseData = await Course.find();

      const courseData2 = await Programcourse.find();
      const courseData3 = await Othercourse.find();
      res.render("course", {
        message: "added successfully",
        course: courseData,
        program: courseData2,
        other: courseData3,
      });
    }
    if (type === "programElective") {
        const programcourse = new Programcourse({
          coursename: name,
          courseid: index,
          semester: sem,
          branch: branch,
        });
        const courseData1 = await programcourse.save();
        const courseData = await Course.find();
  
        const courseData2 = await Programcourse.find();
        const courseData3 = await Othercourse.find();
        res.render("course", {
          message: "added successfully",
          course: courseData,
          program: courseData2,
          other: courseData3,
        });
      }
      else{
        const othercourse = new Othercourse({
            coursename: name,
            courseid: index,
            semester: sem,
            branch: branch,
          });
          const courseData1 = await othercourse.save();
          const courseData = await Course.find();
    
          const courseData2 = await Programcourse.find();
          const courseData3 = await Othercourse.find();
          res.render("course", {
            message: "added successfully",
            course: courseData,
            program: courseData2,
            other: courseData3,
          });
      }
  } catch (error) {
    console.log(error.message);
  }
};

const deletecourse = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    if (userData.is_admin == 0) {
      res.render("404", { message: "you are not an admin" });
    } else {
      const id = req.query.id;
      const d1= await Course.findOne({_id:id});
      const d2= await Programcourse.findOne({_id:id});
      const d3= await Othercourse.findOne({_id:id});
      console.log(id);
      if(d1){
            console.log("check1");
          await Course.deleteOne({ _id: id });

      }
      else{
        if(d2){
            console.log("check2");
            await Programcourse.deleteOne({ _id: id });
        }
        else{
            console.log("check3");
            await Othercourse.deleteOne({ _id: id });
        }
      }
      res.redirect("/admin/home");
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
    if (userData1.is_admin == 0) {
      res.render("404", { message: "you are not an admin" });
    } else {
      res.render("ttgen", {
        admin: userData1,
        corecourse: coursedata1,
        programcourse: coursedata2,
        othercourse: coursedata3,
        facultycourse: coursedata4,
      });
    }
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
    if (userData1.is_admin == 0) {
      res.render("404", { message: "you are not an admin" });
    } else {
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
    }
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
    if (userData1.is_admin == 0) {
      res.render("404", { message: "you are not an admin" });
    } else {
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
    }
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
    if (userData1.is_admin == 0) {
      res.render("404", { message: "you are not an admin" });
    } else {
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
    }
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
    // console.log(course)
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
    if (userData1.is_admin == 0) {
      res.render("404", { message: "you are not an admin" });
    } else {
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
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  newUserLoad,
  addUser,
  newFacultyLoad,
  addFaculty,
  addUserMail,
  addcourseLoad,
  addcourse,
  deletecourse,
  ttgenLoad,
  ttgenLoady20,
  ttgenLoady21,
  ttgenLoady22,
  ttgenLoady23,
  loaddevelop
};
