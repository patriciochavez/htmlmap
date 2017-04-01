var path = require('path');
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var cookieParser = require('cookie-parser');
var http = require('http');
var NodeTtl = require( "node-ttl" );
var toAuth = new NodeTtl({
        ttl: 600,
        checkPeriode: 620});
/*var authorized = new NodeTtl({
        ttl: 100,
        checkPeriode: 120});*/

var location = new Object();

var httpServer = http.createServer(app).listen(8080);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true
        }));

app.use(cookieParser());
app.set('views', __dirname + '/views')
app.set('view engine', 'jade');

var sesiones = new Array();
var usuario = "rayen";
var password = "mgx506";
var token;

function validarUsuario (u,p){    
    if (u==usuario && p==password) {
        token = Math.random().toString(36).substring(7);
        sesiones.push(token);
        //buscar la forma de borrar la sesion del array cuando expire    
    } else {
        token="incorrecto";
    }
}

/*function validarToken(guest){  
    if (guest == toAuth.get(guest)){        
    sesiones.push(guest);        
    return true;
    }
    return false;
}*/

app.get(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
        case '/test':
            res.send("Ok!");
            break;
        case '/pos.html':
            res.sendFile(__dirname + req.params[0]);
            break;
        case '/':
            res.render('login',{title:'Login'});
            res.end();                     
            break;
        case '/token':
            var guest = req.query.guest;        
            if (guest == toAuth.get(guest)) {
                sesiones.push(guest);                
                console.log(guest);
                res.cookie('token', guest, { expires: new Date(Date.now() + 900000) } );
                res.redirect('/pos.html');                    
                } else {
                    res.redirect('/');                    
                }        
            break;
    default:
        res.sendFile(__dirname + req.params[0]);
        }
 });
 
 app.post(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
     case '/toauth':
        var android = new Object();
        android = JSON.parse(req.body.json);
        if(android.usuario == usuario && android.password == password){
        var token_toAuth = Math.random().toString(36).substring(7);        
        toAuth.push(token_toAuth, token_toAuth);
        res.send(token_toAuth);
        }
        break;     
     case '/f_validarUsuario':
        token=null;
        validarUsuario(req.body.nombre, req.body.password);
        console.log( "login: " + token);
        if (token!="incorrecto"){
            res.cookie('token', token, { expires: new Date(Date.now() + 900000) } );
            res.send({message: 'correcto', accion: 'redirect', destino:'/pos.html'});
        }else{
            res.send({message:'incorrecto', accion: 'redirect', destino:'/'});
        }
                res.end();
                break;
    case '/f_validarToken':
        var token_recibido = req.body.id;
        var token_existente = false;
        for (i = 0; i < sesiones.length; i++) {
            if(sesiones[i]==token_recibido){
                token_existente = true;
            }
        }
        if(token_existente==true){
            res.send({message:'correcto', accion: 'nada'});
        }else{
            res.send({message:'incorrecto', accion: 'nada'});
        }
                res.end();
                break;
    default:  
    }
 });
