import express from 'express';
import bodyParser from 'body-parser';


var app = express(); 
app.use(bodyParser.urlencoded({ extended: false })) 

app.get('/', function async(req, res) { 
    // res.send("Hello from Server"); 
    

}) 

app.post('/', function(req, res) {    
    res.send('Got the temp data, thanks..!!');     
    console.log(JSON.stringify(req.body)); 
}) 


var server = app.listen(5000, function () {    
 console.log("Example server listening at ") 
})