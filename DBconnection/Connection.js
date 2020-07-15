const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config();
mongoose.connect(`mongodb+srv://dileep_519:${process.env.PASSWORD_REQ}@usersdata-f8xkd.mongodb.net/Games_DB?retryWrites=true&w=majority`,{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true},(err)=>{
    err?console.log("Error in connection"):console.log("Connected to db");
});
