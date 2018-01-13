// router is setting the routes!
const router = require('express').Router();

const passport = require('passport');

const request = require('request');

//getting models, connecting to mongodb
let db = require('../models');

//keys and tokens
let bearerToken = process.env.bearerToken || require('./env').bearerToken;

let authenticateUser = (req,res,next)=>{
	if(req.isAuthenticated()) return next();

	res.redirect('/');
};

//landing page for router.  Login functionality, checks if there's a session in play and allows for a new session search queries.
router.get('/',(req,res)=>{
	res.send('you got here!');
});

router.get('/signup',(req,res)=>{
	res.render('signup', { message: req.flash('signupMessage')});
});

router.post('/signup',(req,res, next)=>{
	// res.send(req.body);
	let signupStrategy=passport.authenticate('local-signup',{
		//route doesn't have to show a page, but redirect to something that will interact with the user.
		successRedirect: '/',
		failureRedirect: '/signup',
		failureFlash: true
	});

	return signupStrategy(req, res, next);
});

router.get('/login',(req,res)=>{
	res.render('login', { message: req.flash('signupMessage')});
});

router.post('/login',(req,res,next)=>{
	let loginStrategy = passport.authenticate('local-login',{
		successRedirect: '/reduceRestaurants',
		failureRedirect: '/login',
		failureFlash: true
	});
});

//req.session.passport.user.id FTW!
router.get('/newSession', authenticateUser, (req,res)=>{
	let options = {
		url: 'https://api.yelp.com/v3/businesses/search?location=12955+Lafayette+St,80241&radius=8000&price=1,2,3&sort_by=rating&term=food&open_now=true&limit=30',
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
				phone: business.display_phone
				//coupleId?
			};
			db.Restaurant.create(newRestaurant,(err, newRest)=>{
				if(err) console.log("Error Creating Restaurant:",err);
				console.log("Created New Restaurant:",newRest.name);
			});
		});
		res.redirect('/reduceRestaurants');
		});
	});
});

//Main functional page of the app.  Will detect user and display appropriate information.  If not that user's turn will display Shakeitspeare poems(Stretch).
//Needs to determine how many restaurants there are.  If >5, reduce to 5.  If >2, reduce to 2.  If >1, reduce to 1.  If 1, That's where you go!
router.get('/reduceRestaurants', authenticateUser, (req, res)=>{
	//put coupleId in here!
	db.Restaurant.find({},(err, restaurants)=>{
		if(err) console.log('There has been an error',err);
		console.log(restaurants);
		res.render('./removeCardLayout',{restaurants:restaurants});
	});

});

//don't forget coupleId!
router.delete('/reduceRestaurants/:id', authenticateUser, (req,res)=>{
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
});

router.get('/whosTurn/:user', (req,res)=>{
	//will access the mongoDB and determine if it is the user's turn yet.  Might end up using JSON data instead of :user.
	//if it is not the user's turn, will return a 'waiting for your partner to choose'
	//if it is the user's turn, will bring up the selection page
	res.send('This will check to see if the other user has completed their turn, and if so, send the user to perform selections');
});

//catch all bad pages
router.get('*', (req,res)=>{
	res.send('You have attempted to reach a page that does not exist');
});



module.exports = router;