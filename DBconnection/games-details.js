const mongoose=require('mongoose');

const games=new mongoose.Schema({
    Rank:{
        type:Number,
        required:true,
        trim:true
    },
    Name:{
        type:String,
        required:true,
        trim:true
    },
    Platform:{
        type:String,
        required:true,
        trim:true
    },
    Year:{
        type:Number,
        required:true
    },
    Genre:{
        type:String,
        required:true,
        trim:true
    },
    Publisher:{
        type:String,
        required:true,
        trim:true        
    },
    Global_Sales:{
        type:Number,
        required:true
    },
    Price:{
        type:Number,
        required:true
    }
});

const games_details=mongoose.model('games_details',games);
module.exports=games_details;