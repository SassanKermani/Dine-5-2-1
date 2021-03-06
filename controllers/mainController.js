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
			res.redirect('/Restaurants');
		} else{
			res.render('./newSearch');
		}
	});
};

//creates new restaurant reduction session
//CREATE
var postNewSession = (req, res)=>{

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
		//This will refresh a session with new data.
		db.Restaurant.remove({couple: req.user.couple},()=>{
			//checking for valid search results.  If no businesses are returned will send back to search screen
			if(!restaurantData.businesses){
				return res.redirect('/newSession');
			}else{
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
				});
			});
			db.Couple.findOne({_id: req.user.couple}, (err, couple)=>{
				if(err) return console.log("error searching for couple",err);
				if(couple.whosUp() == req.user._id && req.body.whoStarts === "partner"){
					couple.swap();
				}else if(couple.whosUp() != req.user._id && req.body.whoStarts === "user"){
					couple.swap();
				}
				couple.save((err)=>{
					if(err) return console.log("error saving swap", err);
				});
			});
		}
		res.redirect('/Restaurants');
		});
	});
};

//Restaurant Reduction Page.
//INDEX
var getRestaurants = (req, res)=>{
	db.Restaurant.find({couple: req.user.couple},(err, restaurants)=>{
		if(err) console.log('There has been an error',err);
		res.render('./removeCardLayout',{restaurants:restaurants});
	});
};

//Allows users to reduce restaurants to 5, 2, or 1.  Will swap user when applicable
//DELETE
var deleteRestaurants = (req, res)=>{
	db.Restaurant.remove({_id:req.params.id}, (err,restaurant)=>{
		//functionality for determining whether we keep allowing this or change the page.
		//COUPLE ID!!!
		db.Restaurant.find({couple: req.user.couple},(err, restaurants)=>{
			console.log(restaurants.length,"restaurants left");
			if(restaurants.length===1){
				res.redirect(303,'/eatHere');
			}else if(restaurants.length ===2 || restaurants.length===5){
				db.Couple.findOne({_id: req.user.couple}, (err, couple)=>{
					if(err) console.log("there has been an error,",err);
					couple.swap();
					couple.save((err)=>{
						if(err) return console.log("there has been an error saving coupleSwap", err);
						res.redirect(303,'/waiting');

					});
				});
			}else{
				res.send('restaurant deleted!  Should not be here if restaurant length is 5, 2, or 1');
			}
		});
	});
};

//displays a single restaurant and allows saving to favorites
//SHOW
var getEatHere = (req,res)=>{
	console.log('getting to EatHere');
	db.Restaurant.findOne({couple: req.user.couple}, (err, restaurant)=>{
		if(err) console.log('there has been an error',err);
		res.render('eatHere', {restaurant:restaurant});
	});

};

//removes all restaurants for the couple and redirects to /newSession
var getReset = (req,res)=>{
	db.Restaurant.remove({couple: req.user.couple},(err)=>{
		if(err) console.log("error removing restaurants",err);
		res.redirect('/newSession');
	});
};

//Waiting Page.  Fills Shakeitspeare Poetry.
var getWaiting = (req, res)=>{
	//http://shakeitspeare.com/api/poem?lines=12&markov=5
	request.get("http://shakeitspeare.com/api/poem?lines=12&markov=5", (err, reqApi, body)=>{
		let poem = JSON.parse(body).poem.match( /[^\.!\?]+[\.!\?]+/g);
		res.render('waiting',{poem: poem});
	});
	// res.send("and now we wait");
};

var getFavorites = (req, res)=>{
//fill with stuff
};

//takes input from user click and does magic to store the favorite as an independent restaurant in favorites(alters _id to fav+id)
var postFavorites = (req, res)=>{
	console.log(req.body.favorite);
	db.Couple.findOne({_id: req.user.couple}, (err,couple)=>{
		if(err) console.log("error finding couple in postFavorites",err);
		db.Restaurant.findOne({_id: req.body.favorite}, (err,restaurant)=>{
			if(err) console.log("error finding restaurant in postFavorites",err);
			restaurant._id = "fav"+restaurant._id;
			couple.addToFavorites(restaurant);
			couple.save((err)=>{
				if(err) console.log("error saving couple in postFavorites");
				res.send('success!');
			});
		});
	});

};

//logs out the user
var getLogout = (req, res)=>{
	req.logout();
	res.redirect('/');
};

//catches all invalid routes.
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
module.exports.getEatHere = getEatHere;
module.exports.getReset = getReset;
module.exports.getWaiting = getWaiting;
module.exports.getFavorites = getFavorites;
module.exports.postFavorites = postFavorites;
module.exports.getLogout = getLogout;
module.exports.getBadRoutes = getBadRoutes;