const express= require("express");
const admin_route=express();

const session=require("express-session");
const config=require("../config/config");
admin_route.use(session({secret:config.sessionSecret}))
 
const bodyParser= require("body-parser");
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));

admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

const multer=require("multer");
const path=require("path");

admin_route.use(express.static('public')); //public se img access karne ke liye (but humne toh img dali nahi)

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

const auth=require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");


admin_route.get('/',auth.isLogout,adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);

admin_route.get('/home',auth.isLogin,adminController.loadDashboard);

admin_route.get('/logout',auth.isLogin,adminController.logout);


admin_route.get('/add-course',auth.isLogin,adminController.addcourseLoad);
admin_route.post('/add-course',upload.single('image'),adminController.addcourse);

admin_route.get('/developedBy',adminController.loaddevelop);


admin_route.get('/ttgen',auth.isLogin,adminController.ttgenLoad);
admin_route.get('/ttgen/y20',auth.isLogin,adminController.ttgenLoady20);
admin_route.get('/ttgen/y21',auth.isLogin,adminController.ttgenLoady21);
admin_route.get('/ttgen/y22',auth.isLogin,adminController.ttgenLoady22);
admin_route.get('/ttgen/y23',auth.isLogin,adminController.ttgenLoady23);

admin_route.get('/new-user',auth.isLogin,adminController.newUserLoad);
admin_route.post('/new-user',upload.single('image'),adminController.addUser);

admin_route.get('/new-faculty',auth.isLogin,adminController.newFacultyLoad);
admin_route.post('/new-faculty',upload.single('image'),adminController.addFaculty);

admin_route.get('/delete-course',adminController.deletecourse);

admin_route.get('*',function(req,res){s
    res.redirect('/admin');
});


module.exports=admin_route;

