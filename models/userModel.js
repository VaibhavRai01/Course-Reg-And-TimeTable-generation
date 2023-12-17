const mongoose = require("mongoose");
const userSchema= new mongoose.Schema({
    rollno:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    branch:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
        
    },
    password:{
        type: String,
        required:true
    },
    semester:{
        type:String,
        required:true
    },
    is_varified:{
        type:Number,
        default:0
    },
    is_faculty:{
        type:Number,
        default:0
    },
    is_admin:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:''
    }
});


module.exports= mongoose.model('User',userSchema);





