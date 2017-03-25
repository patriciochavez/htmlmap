var path = require('path');
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

var http = require('http');

var location = new Object();

var httpServer = http.createServer(app).listen(8080);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true
        }));

app.get(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
        case '/test':
            res.send("Ok!");
            break;
        case '/pos.html':
            res.sendFile(__dirname + req.params[0]);
            break;            
    default: //res.sendFile( __dirname + req.params[0]); 
    }
 });
 