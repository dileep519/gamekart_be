require("./DBconnection/Connection");
const dotenv=require('dotenv');
const express=require("express");
const app=express();
const auth=require("./Router/Auth");
const cors=require("cors");
const port=process.env.PORT || 3001;
const bodyParser = require('body-parser');
dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(cors());

app.use("/api/user",auth);

app.listen(port,()=>{
    console.log("Server is up");
})