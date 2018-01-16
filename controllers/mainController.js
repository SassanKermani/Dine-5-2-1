const request = require('request');
const passport = require('passport');


//getting models, connecting to mongodb
let db = require('../models');

//keys and tokens
let bearerToken = process.env.bearerToken || require('../config/env').bearerToken;

//displays signup Page.
var getSignup = (req, res)=>{
	res.render('signup', { message: req.flash('signupMessage')});
};

//creates new user
var postSignup = (req, res, next)=>{
	console.log(req.body)
	let signupStrategy=passport.authenticate('local-signup',{
		//route doesn't have to show a page, but redirect to something that will interact with the user.
		successRedirect: '/newSession',
		failureRedirect: '/signup',
		failureFlash: true
	});

	return signupStrategy(req, res, next);
};

//displays login page
var getLogin = (req, res)=>{
	res.render('login', { message: req.flash('signupMessage')});
};

//redirects after login
var postLogin = (req, res, next)=>{
	let loginStrategy = passport.authenticate('local-login',{
		successRedirect: '/newSession',
		failureRedirect: '/login',
		failureFlash: true
	});

	return loginStrategy(req, res, next);
};

//displays search page if uninitialized.  Otherwise sends to /Restaurants
var getNewSession = (req, res)=>{
	db.Restaurant.find({couple: req.user.couple}, (err, restaurants)=>{
		if(restaurants.length>0){
			console.log('User Session exists.  Redirecting to /Restaurant');
			console.log('restaurants:',restaurants);
			res.redirect('/Restaurants');
		} else{
			console.log('No Session exists.  Continuing on');
			res.render('./partials/newSearch');
		}
	});
};

//creates new restaurant reduction session
var postNewSession = (req, res)=>{
	console.log('got to post new session');

	//removing spaces from address and adding + signs
	let address = req.body.address.replace(/ /g, '+');

	//setting default search parameter for price to everything
	let price = '1,2,3,4';

	console.log("req.body.whoStarts:",req.body.whoStarts);
	//updating search paramters to what user input
	if(req.body.OneDollar || req.body.TwoDollar || req.body.ThreeDollar || req.body.FourDollar){
		price = '';
		if(req.body.OneDollar) price = price + req.body.OneDollar+',';
		if(req.body.TwoDollar) price = price + req.body.TwoDollar+',';
		if(req.body.ThreeDollar) price = price + req.body.ThreeDollar+',';
		if(req.body.FourDollar) price = price + req.body.FourDollar+',';
		//yelp doesn't like trailing commas.  this fixes that
		price = price.slice(0,-1);
	}

	//this is how we create the URL for Yelp's API
	let options = {
		//removing &radius=8000 to see if i get better results
		url: 'https://api.yelp.com/v3/businesses/search?location='+address+'&price='+price+'&sort_by=rating&term=food&open_now=true&limit=25',
		auth:{
			bearer: bearerToken
		}
	};
	request.get(options, (err, reqApi, body)=>{
		if(err) console.log('there has been an error', err);
		let restaurantData = JSON.parse(body);
		console.log('We made an API Call!');
		//This will refresh a session with new data.
		//Make sure to put something in the {} when we get to users!!!!!  Maybe coupleId: uniqueCoupleId
		console.log('restaurantData:',restaurantData);
		console.log('req.user:',req.user);
		db.Restaurant.remove({couple: req.user.couple},()=>{
			restaurantData.businesses.forEach((business)=>{
			let foodCats = [];
			business.categories.forEach((category)=>{
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
				phone: business.display_phone,
				couple: req.user.couple
			};
			db.Restaurant.create(newRestaurant,(err, newRest)=>{
				if(err) console.log("Error Creating Restaurant:",err);
				console.log("Created New Restaurant:",newRest.name);
			});
		});
		if(req.body.whoStarts==="partner"){
			console.log("User selected partner starts.  Making sure that happens");
			db.Couple.findOne({_id: req.user.couple}, (err, couple)=>{
				if(err) return console.log("error searching for couple",err);
				if(couple.whosUp() == req.user._id){
					console.log("user is currently up in couple.  Need to swap");
					couple.swap();
					couple.save((err)=>{
						if(err) return console.log("error saving swap", err);
					});
				}
			});
		}
		res.redirect('/Restaurants');
		});
	});
};

//Restaurant Reduction Page.
var getRestaurants = (req, res)=>{
	db.Restaurant.find({couple: req.user.couple},(err, restaurants)=>{
		if(err) console.log('There has been an error',err);
		console.log("Making",restaurants.length,"restaurants");
		res.render('./removeCardLayout',{restaurants:restaurants});
	});
};

//Allows users to reduce restaurants to 5, 2, or 1.  Will swap user when applicable
var deleteRestaurants = (req, res)=>{
	console.log("Hit Delete Route!");
	db.Restaurant.remove({_id:req.params.id}, (err,restaurant)=>{
		console.log('Restaurant Deleted!');
		//functionality for determining whether we keep allowing this or change the page.
		//COUPLE ID!!!
		db.Restaurant.find({couple: req.user.couple},(err, restaurants)=>{
			console.log(restaurants.length,"restaurants left");
			if(restaurants.length===1){
				res.redirect('/eatHere');
			}else if(restaurants.length ===2 || restaurants.length===5){
				console.log("Time to switch users!");
				db.Couple.findOne({_id: req.user.couple}, (err, couple)=>{
					if(err) console.log("there has been an error,",err);
					console.log('swapping users, couple:',couple);
					couple.swap();
					couple.save((err)=>{
						if(err) return console.log("there has been an error saving coupleSwap", err);
						console.log('swapped users, couple: ', couple);
						res.redirect(303,'/waiting');

					});
				});
			}else{
				res.send('restaurant deleted!  Should not be here if restaurant length is 5, 2, or 1');
			}
		});
	});
};

//Waiting Page.  Will put Shakeitspeare Poetry in here.
var getWaiting = (req, res)=>{
	console.log("And now we wait");
	//http://shakeitspeare.com/api/poem?lines=12&markov=5
	res.send("and now we wait");
};

var getLogout = (req, res)=>{
	req.logout();
	res.redirect('/');
};

var getBadRoutes = (req, res)=>{
	res.send('You have attempted to reach a page that does not exist');
};

module.exports.getSignup = getSignup;
module.exports.postSignup = postSignup;
module.exports.getLogin = getLogin;
module.exports.postLogin = postLogin;
module.exports.getNewSession = getNewSession;
module.exports.postNewSession = postNewSession;
module.exports.getRestaurants = getRestaurants;
module.exports.deleteRestaurants = deleteRestaurants;
module.exports.getWaiting = getWaiting;
module.exports.getLogout = getLogout;
module.exports.getBadRoutes = getBadRoutes;