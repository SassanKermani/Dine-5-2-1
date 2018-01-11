// let auths = require('./config/env');
let express = require('express');
let request = require('request');
let app = express();
let passport = require('passport');
let flash = require('connect-flash');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let session = require('express-session');


//keys and tokens
let bearerToken = process.env.bearerToken || require('./config/env').bearerToken;
// let googleKey = auths.googleKey;

//getting models, connecting to mongodb
let db = require('./models');

//using morgan in dev mode to log every route request.  Hopefully it will help me find out where I break things
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// let db = require('./models');

//app.use(express.static('public'));

//landing page for app.  Login functionality, checks if there's a session in play and allows for a new session search queries.
app.get('/',function(req,res){
	res.send('you got here!');
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
		let restList = [];
		//This will refresh a session with new data.
		//Make sure to put something in the {} when we get to users!!!!!
		db.Restaurant.delete({});
		restaurantData.businesses.forEach(function(business){
			let foodCats = [];
			business.categories.forEach(function(category){
				foodCats.push(category.title);
			});
			let newRestaurant = {
				name: business.name,
				categories: foodCats,
				price: business.price,
				rating: business.rating,
				reviews: business.review_count,
				image: business.image_url,
				website: business.url,
				address: business.location.display_address,
				phone: business.phone
				//coupleId?
			};
			db.Restaurant.create(newRestaurant,function(err, newRest){
				if(err) console.log("Error Creating Restaurant:",err);
				console.log("Created New Restaurant:",newRest);
			});
			restList.push(newRestaurant);
		});
		res.redirect('/reduceRestaurants');
	});
});

//Main functional page of the app.  Will detect user and display appropriate information.  If not that user's turn will display Shakeitspeare poems(Stretch).
//Needs to determine how many restaurants there are.  If >5, reduce to 5.  If >2, reduce to 2.  If >1, reduce to 1.  If 1, That's where you go!
app.get('/reduceRestaurants', function(req, res){

});

app.delete('/reduceRestaurants',function(req,res){
	//once restaurants are selected to be deleted, this will remove the restaurant from the list of available ones.
	//request is an array of ids in JSON
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
