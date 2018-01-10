var auths = require('./config/env');
var express = require('express');
var request = require('request');
var app = express();
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');

var bearerToken = auths.bearerToken;
var googleKey = auths.googleKey;



//using morgan in dev mode to log every route request.  Hopefully it will help me find out where I break things
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// var db = require('./models');

//app.use(express.static('public'));

app.get('/',function(req,res){

});


app.delete('/restaurants/:user',function(req,res){
	//once restaurants are selected to be deleted, this will remove the restaurant from the list of available ones.
	//returned as an array of ids in JSON
});

app.get('/whosTurn/:user', function(req,res){
	//will access the mongoDB and determine if it is the user's turn yet.  Might end up using JSON data instead of :user.
	//if it is not the user's turn, will return a 'waiting for your partner to choose'
	//if it is the user's turn, will bring up the selection page
	res.send('This will check to see if the other user has completed their turn, and if so, send the user to perform selections');
});

//catch all bad pages
app.get('*', function(req,res){
	res.send('You have attempted to reach a page that does not exist');
});


//Server starting up
app.listen(process.env.PORT || 3000, function(){
	console.log("Potato Server is running on port", process.env.port || 3000);
});
