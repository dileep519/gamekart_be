const router=require("express").Router();
const validator=require("email-validator");
const bcrypt=require("bcryptjs");
const userDetails=require("../DBconnection/user-details");
const gamesdetails=require("../DBconnection/games-details");
const jwt=require("jsonwebtoken");
const verify=require("../Middlewear/verify");
const { ObjectID } = require("mongodb");
const { response } = require("express");

router.post("/Signup",(req,response)=>{
     if(validator.validate(req.body.email)){
        userDetails.findOne({email:req.body.email}).then((res)=>{
            if(res===null){
                const userdetails=async  ()=>{
                    const user=new  userDetails({
                        name:req.body.name,
                        email:req.body.email,
                        password:req.body.password
                     });
                     const saveuser=await user.save();
                }
                try{
                    userdetails();
                } catch(err){
                    response.status(200).send({error:"Error"});
                }
                response.status(200).send({error:""});   
            }else{
                response.status(200).send({error:"Email taken"});
            }
        }).catch((err)=>{
            console.log(err);
        })
    }else{
        response.status(200).send({error:"Invalid email"});
    }
});


router.post("/Login",async (req,res)=>{
    if(!validator.validate(req.body.email)){
        res.status(200).send({error:"Invalid Email"});
    }
    const userExist=await userDetails.findOne({email:req.body.email});
    if(!userExist){
        res.status(200).send({error:"User does not exist"});
    }
    const compare=await bcrypt.compare(req.body.password,userExist.password);
    if(!compare){
        res.status(200).send({error:"Email or Password in correct"});
    }
    const value=jwt.sign({_id:userExist._id},process.env.TOKEN_SECRET,{ expiresIn: '7d' });
    res.header('auth_token',value).status(200).send({token:value});

})

router.post("/games",verify,(req,res)=>{
    if(!req.body.search){
        gamesdetails.find({}).then((response)=>{
            let total_pages=Math.ceil((response.length/20));
                let total_rec=response.length;
                res.send({data:response.slice((parseInt(req.query.page)-1)*20,(parseInt(req.query.page))*20),page:req.query.page,total_pages,total_rec,search:"",error:""});
        }).catch((err)=>{
            res.send({data:"",error:"Error occured1"});
        })
    }else{
        try{
            let element=req.body.search
            element=new RegExp(".*"+element+".*",'ig');
            gamesdetails.find({Name:element}).then((response)=>{
                let total_pages=Math.ceil((response.length/20))
                let total_rec=response.length;
                let filters=[];
                for(let i=0;i<response.length;i++){
                    let t=filters.indexOf(response[i].Publisher);
                    if(t==-1){
                        filters.push(response[i].Publisher);
                    }
                }
                if(req.query.sort && req.query.filter){
                    if(req.query.sort=='Rank'){
                        response.sort((a,b)=>{
                            return a.Rank-b.Rank;
                        })
                    }else{
                        response.sort((a,b)=>{
                            return a.Price-b.Price;
                        })
                    }
                    let data=[];
                    for(let i=0;i<response.length;i++){
                        if(response[i].Publisher==req.query.filter){
                            data.push(response[i]);
                        }
                    }response=data;
                    res.send({data:response.slice((parseInt(req.query.page)-1)*20,(parseInt(req.query.page))*20),page:req.query.page,total_pages,total_rec,search:req.body.search,filters,error:""})
                }else if(req.query.sort && !req.query.filter){
                    if(req.query.sort=='Rank'){
                        response.sort((a,b)=>{
                            return a.Rank-b.Rank;
                        })
                    }else{
                        response.sort((a,b)=>{
                            return a.Price-b.Price;
                        })
                    }
                    res.send({data:response.slice((parseInt(req.query.page)-1)*20,(parseInt(req.query.page))*20),page:req.query.page,total_pages,total_rec,search:req.body.search,filters,error:""})
                }else if(!req.query.sort && req.query.filter){
                    let data=[];
                    for(let i=0;i<response.length;i++){
                        if(response[i].Publisher==req.query.filter){
                            data.push(response[i]);
                        }
                    }response=data;
                    res.send({data:response.slice((parseInt(req.query.page)-1)*20,(parseInt(req.query.page))*20),page:req.query.page,total_pages,total_rec,search:req.body.search,filters,error:""})
                }
                else{
                    res.send({data:response.slice((parseInt(req.query.page)-1)*20,(parseInt(req.query.page))*20),page:req.query.page,total_pages,total_rec,search:req.body.search,filters,error:""});
                }
            }).catch((err)=>{
                res.send({data:"",error:err})
            })
        }catch(err){
            res.send({data:"",error:err});
        }
    }
})

router.post("/cart",verify,(req,res)=>{
    if(req.user){
        let z=[];
        userDetails.findById({_id:req.user._id}).then((response)=>{
            z=[...response.cart];
            let flag=0;
            for(let i=0;i<z.length;i++){
                if(z[i].Rank===req.body.Rank){
                    flag=1;
                    break;
                }
            }
            if(flag==0){
                z.push({
                    Rank:req.body.Rank,
                    Name:req.body.Name,
                    Platform:req.body.Platform,
                    Year:req.body.Year,
                    Genre:req.body.Genre,
                    Publisher:req.body.Publisher,
                    Global_Sales:req.body.Global_Sales,
                    Price:req.body.Price})
                userDetails.findByIdAndUpdate({_id:req.user._id},{
                    cart:z
                },{
                    new:true
                }).then((res1)=>{
                    res.send({count:res1.cart.length,error:""})
                }).catch((err)=>{
                    res.send({error:"Error"});
                })
            }else{
                res.send({count:"",error:""})
            }
        }).catch((err)=>{
            res.send({error:"Please check Conection"});
        })
    }
})

router.post("/games/count",verify,(req,res)=>{
    if(req.user){
        userDetails.findById({_id:req.user._id}).then((response)=>{
            res.send({count:response.cart.length});
        })
    }else{
        res.send({Error:"Access Denied"});
    }
})

router.post("/find",verify,(req,res)=>{
    if(req.user){
        userDetails.findById({_id:req.user._id}).then((response)=>{
            let z=[...response.cart];
            let flag=0;
            for(let i=0;i<z.length;i++){
                if(z[i].Rank==req.body.Rank){
                    flag=1;
                    break;
                }
            }
            if(flag==1){
                res.send({Added:true});    
            }else{
                res.send({Added:false});
            }
        }).catch((err)=>{
            console.log(err);
        })
    }else{
        res.send({Added:false});
    }
})

router.post('/findcart',verify,(req,res)=>{
    if(req.user){
        userDetails.findById({_id:req.user._id}).then((response)=>{
            let total_pages=Math.ceil(response.cart.length/20);
            let total_rec=response.cart.length;
            res.send({data:response.cart,page:req.query.page,total_rec,total_pages,search:"",error:""});
        })
    }else{
        res.send({data:"",error:"Invalid user"});
    }
})

router.post("/userdetails",verify,(req,res)=>{
    if(req.user){
        userDetails.findById({_id:req.user._id}).then((response)=>{
            res.send({id:response._id,Phone:response.phone,Name:response.name,Email:response.email,Address:response.address[response.address.length-1]});
        })
    }
})
router.post("/addorder",verify,(req,res)=>{
    if(req.user){
        userDetails.findById({_id:req.user._id}).then((response)=>{
            let z=[...response.cart];
            let flag=-1;
            for(let i=0;i<z.length;i++){
                if(z[i].Rank===req.body.item.Rank){
                    flag=i;
                    break;
                }
            }
            if(flag!=-1){
                z.splice(flag,1);
            }
            let t;
            if(!response.orders){
                t=[];
            }else{
                t=[...response.orders];
            }
            t.push({
                id:new ObjectID(),
                Rank:req.body.item.Rank,
                Name:req.body.item.Name,
                Platform:req.body.item.Platform,
                Year:req.body.item.Year,
                Genre:req.body.item.Genre,
                Publisher:req.body.item.Publisher,
                Global_Sales:req.body.item.Global_Sales,
                Price:req.body.item.Price
            })
            if(response.address.length==0){
                let address={
                    house:req.body.houseNo,
                    street:req.body.street,
                    area:req.body.area,
                    city:req.body.city,
                    pincode:req.body.pincode,
                };
                userDetails.findByIdAndUpdate({_id:req.user._id},{
                    cart:z,
                    orders:t,
                    address:address,
                    phone:req.body.Phone
                }).then((response22)=>{
                    res.send({done:true,error:"",cart_count:z.length,data:z});
                }).catch((err)=>{
                    res.send({done:false,error:err});
                })
            }else{
                userDetails.findByIdAndUpdate({_id:req.user._id},{
                    cart:z,
                    orders:t
                }).then((response22)=>{
                    res.send({done:true,err:"",cart_count:z.length,data:z});
                }).catch((err)=>{
                    res.send({done:false,error:err});
                })
            }
        }).catch((err)=>{
            console.log(err);
        })
    }
})
router.post("/orders",verify,(req,res)=>{
    if(req.user){
        userDetails.findById({_id:req.user._id}).then((response)=>{
            let total_rec=response.orders.length;
            let total_pages=Math.ceil(response.orders.length/20);
            res.send({data:response.orders,page:1,total_rec,total_pages,search:"",error:""})
        })
    }
})
module.exports=router;