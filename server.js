let auths = require('./config/env');
let express = require('express');
let request = require('request');
let app = express();
let passport = require('passport');
let flash = require('connect-flash');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let session = require('express-session');

let bearerToken = process.env.bearerToken || auths.bearerToken;
let googleKey = auths.googleKey;



//using morgan in dev mode to log every route request.  Hopefully it will help me find out where I break things
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// let db = require('./models');

//app.use(express.static('public'));

app.get('/',function(req,res){

});

app.get('/newSession', function(req,res){
		let options = {
		url: 'https://api.yelp.com/v3/businesses/search?location=12955+Lafayette+St,Thornton,Co,80241&radius=8000&price=1,2,3&sort_by=rating&term=food&open_now=true&limit=50',
		auth:{
			bearer: bearerToken
		}
	};
	request.get(options, (err, reqApi, body)=>{
		if(err) console.log('there has been an error', err);
		let restaurantData = JSON.parse(body);
		console.log('we got info back!');
		console.log(restaurantData);
		res.send(restaurantData);
	});
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
