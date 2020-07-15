require("./DBconnection/Connection");
const games_details=require("./DBconnection/games-details");
const mongoose=require('mongoose');
const request=require("request");
const url="http://starlord.hackerearth.com/TopSellingGames";

request({url,json:true},(err,res)=>{
    for(let i=0;i<res.body.length;i++){
        let year=res.body[i].Year=="N/A"?2008:res.body[i].Year;
        games_details.insertMany({
            Rank:res.body[i].Rank,
            Name:res.body[i].Name,
            Platform:res.body[i].Platform,
            Year:year,
            Genre:res.body[i].Genre,
            Publisher:res.body[i].Publisher,
            Global_Sales:res.body[i].Global_Sales,
            Price:Math.floor((Math.random()*100)+1)     
        }).then(()=>{
        }).catch((err)=>{
                console.log(err);
        });
        }
});