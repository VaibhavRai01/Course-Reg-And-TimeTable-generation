const mongoose=require("mongoose");
mongoose.connect("mongodb+srv://21ucs155:Pranjal%402310@cluster0.zhjctek.mongodb.net/course-reg");
const express= require("express");
const port = process.env.PORT || 3000;
const app=express();
const path = require("path");
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
//for user routes
const userRoute =require('./routes/userRoute');
app.use('/',userRoute);

//for admin route
const adminRoute =require('./routes/adminRoute');

app.use('/admin',adminRoute);
// app.use(express.static(''))

app.listen(port,function(){
    console.log(`server running at port ${port}`);
});