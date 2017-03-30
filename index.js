var path = require('path');
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var cookieParser = require('cookie-parser');
const cache = require('nnash');
var http = require('http');

var location = new Object();
const invitados = new cache({ stdTTL: 100, checkperiod: 120 });
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
var token ;

function validarUsuario (u,p){
    if (u==usuario && p==password) {
        token = Math.random().toString(36).substring(7);
        sesiones.push(token);
        //buscar la forma de borrar la sesion del array cuando expire
    } else{
        token="incorrecto";
    }
}

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
            const mykeys = invitados.keys(); 
            console.log(mykeys);
            res.send(mykeys);
            break;
    default:
        res.sendFile(__dirname + req.params[0]);
        }
 });
 
 app.post(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
     case '/token':
        var token_invitado = Math.random().toString(36).substring(7);        
        const success = invitados.set('token_invitado', token_invitado);        
        res.send(token_invitado);
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
