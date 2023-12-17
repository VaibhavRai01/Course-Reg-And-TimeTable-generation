const mongoose = require("mongoose");
const courseSchema= new mongoose.Schema({
    rollno:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    corecourses:{
        type:[String],
        default: function () {
            return new Array(10).fill("");
          }
    },
    programcourses:{
        type:[String],
        default: function () {
            return new Array(10).fill("");
          }
    },
    othercourses:{
        type:[String],
        default: function () {
            return new Array(10).fill("");
          }
    },
});


module.exports= mongoose.model('Coursereg',courseSchema);





