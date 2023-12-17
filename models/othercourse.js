const mongoose = require("mongoose");
const courseSchema= new mongoose.Schema({
    courseid:{
        type:String,
        required:true
    },
    coursename:{
        type:String,
        required:true
    },
    
    semester:{
        type:Number,
        required:true
    },
    branch:{
        type:String,
        required:true
    }
});


module.exports= mongoose.model('Othercourse',courseSchema);





