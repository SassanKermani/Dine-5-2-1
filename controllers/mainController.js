const request = require('request');
const passport = require('passport');


//getting models, connecting to mongodb
let db = require('../models');

//keys and tokens
let bearerToken = process.env.bearerToken || require('../config/env').bearerToken;

var getSignup = (req, res)=>{
	res.render('signup', { message: req.flash('signupMessage')});
};

var postSignup = (req, res, next)=>{
	console.log(req.body)
	let signupStrategy=passport.authenticate('local-signup',{
		//route doesn't have to show a page, but redirect to something that will interact with the user.
		successRedirect: '/',
		failureRedirect: '/signup',
		failureFlash: true
	});

	return signupStrategy(req, res, next);
};

var getLogin = (req, res)=>{
	res.render('login', { message: req.flash('signupMessage')});
};

var postLogin = (req, res, next)=>{
	let loginStrategy = passport.authenticate('local-login',{
		successRedirect: '/Restaurants',
		failureRedirect: '/login',
		failureFlash: true
	});

	return loginStrategy(req, res, next);
};

var getNewSession = (req, res)=>{
	//removing spaces from address and adding + signs
	let address = req.body.address.replace(/ /g, '+');
	//setting default search parameter for price to everything
	let price = '1,2,3,4';
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

	let options = {
		url: 'https://api.yelp.com/v3/businesses/search?location='+address+'&radius=8000&price='+price+'&sort_by=rating&term=food&open_now=true&limit=25',
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
		console.log('req.user:',req.user);
		db.Restaurant.remove({},()=>{
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
		res.redirect('/Restaurants');
		});
	});
};

var getRestaurants = (req, res)=>{
	db.Restaurant.find({},(err, restaurants)=>{
		if(err) console.log('There has been an error',err);
		console.log("Making",restaurants.length,"restaurants");
		res.render('./removeCardLayout',{restaurants:restaurants});
	});
};

var deleteRestaurants = (req, res)=>{
	console.log("Hit Delete Route!  Id:",req.params.id);
	db.Restaurant.remove({_id:req.params.id}, (err,restaurant)=>{
		console.log('Restaurant Deleted!');
		//functionality for determining whether we keep allowing this or change the page.
		//COUPLE ID!!!
		db.Restaurant.find({},(restaurants)=>{
			console.log(restaurants);
		});
		res.send('restaurant deleted!');
	});
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
module.exports.getRestaurants = getRestaurants;
module.exports.deleteRestaurants = deleteRestaurants;
module.exports.getLogout = getLogout;
module.exports.getBadRoutes = getBadRoutes;