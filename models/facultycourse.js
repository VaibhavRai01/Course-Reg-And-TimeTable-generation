const mongoose = require("mongoose");
const courseSchema= new mongoose.Schema({
    facultyname:{
        type:String,
        required:true
    },
    courses:{
        type:[String],
        default: function () {
            return new Array(5).fill(".");
          }
    },
    email:{
        type:String,
        required:true,
    }
});


module.exports= mongoose.model('Facultycourse',courseSchema);





