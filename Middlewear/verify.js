const jwt=require("jsonwebtoken");

module.exports=function verify(req,res,next){
    const token=req.header('token');
    if(!token){
        return res.send({error:"Aceess Denied"})
    }
    try{
       const verify = jwt.verify(token,process.env.TOKEN_SECRET);
       req.user=verify;
    }catch(err){
        res.send({error:"Invalid token"});
    }
    next();
}