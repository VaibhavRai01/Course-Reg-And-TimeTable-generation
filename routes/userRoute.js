const express=require("express");
const user_route=express();
const session = require("express-session");

const config = require("../config/config");
user_route.use(session({secret:config.sessionSecret}));

const auth = require('../middleware/auth')

user_route.set('view engine','ejs');
user_route.set('views','./views/users');

const bodyParser= require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

//multer (for images)
const multer=require("multer");
const path=require("path");

user_route.use(express.static('public')); //public se img access karne ke liye (but humne toh img dali nahi)

const storage= multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'));
    },
    filename:function(req,file,cb){
        const name= Date.now()+'-'+file.originalname;
        cb(null,name);
    }
})
const upload=multer({storage:storage});

const userController = require("../controllers/userController");

user_route.get("/register",auth.isLogout,userController.loadRegister);
user_route.post('/register',upload.single('image'),userController.insertUser);

user_route.get("/verify",userController.verifyMail);

user_route.get('/',auth.isLogout,userController.loadRegister);
user_route.post('/',upload.single('image'),userController.insertUser);

user_route.get('/coursereg',auth.isLogin,userController.courseregLoad);
user_route.post('/coursereg',auth.isLogin,userController.coursereg);

user_route.get('/login',auth.isLogout,userController.loginLoad);
user_route.post('/login',userController.verifyLogin);

user_route.get('/home',auth.isLogin,userController.loadHome);
user_route.get('/facultyhome',auth.isLogin,userController.loadfacultyHome);

user_route.get('/developedBy',userController.loaddevelop);

user_route.get('/ttgen',auth.isLogin,userController.ttgenLoad);
user_route.get('/ttgen/y20',auth.isLogin,userController.ttgenLoady20);
user_route.get('/ttgen/y21',auth.isLogin,userController.ttgenLoady21);
user_route.get('/ttgen/y22',auth.isLogin,userController.ttgenLoady22);
user_route.get('/ttgen/y23',auth.isLogin,userController.ttgenLoady23);

user_route.get('/logout',auth.isLogin,userController.userLogout);

user_route.get('/forget',auth.isLogout,userController.forgetLoad);
user_route.post('/forget',auth.isLogout,userController.forgetVerify);

user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);
user_route.post('/forget-password',auth.isLogout,userController.resetPassword);

user_route.get('/verification',auth.isLogout,userController.verificationLink);
user_route.post('/verification',auth.isLogout,userController.sendVerificationLink);




  





module.exports= user_route;
