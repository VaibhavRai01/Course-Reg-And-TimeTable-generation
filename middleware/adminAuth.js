const isLogin= async(req,res,next)=>{
    try {
        if(req.session.user_id){


        }
        else{
            res.redirect('/admin');
        }
        next();
    } catch (error) {
        console.log(erro.message);
    }
}


const isLogout= async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/admin/home');
        }
       
        next();
    } catch (error) {
        console.log(erro.message);
    }
}

module.exports={
    isLogin,
    isLogout
}

