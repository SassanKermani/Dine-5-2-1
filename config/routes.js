// router is setting the routes!
const router = require('express').Router();

const passport = require('passport');

let Restaurant = require('../models').Restaurant;

let Couple = require('../models').Couple;

let mainController = require('../controllers/mainController');

//allows visitor to continue only if they are authenticated users.  Otherwise redirects to landing page.
let authenticateUser = (req,res,next)=>{
	if(req.isAuthenticated()) return next();

	res.redirect('/login');
};

//allows user to continue to remove restaurants only if it is their turn to do so.  Otherwise redirects to a waiting page.
let isUsersTurn = (req,res,next)=>{
	Couple.findOne({_id: req.user.couple}, (err, couple)=>{
		if(err) return console.log("there has been an error in isUsersTurn finding couple.",err);
		if(req.user._id == couple.whosUp()){ 
			return next();
		}

		res.redirect('/waiting');
	});
};

let isOver = (req, res, next)=>{
	Couple.findOne({_id: req.user.couple}, (err, couple)=>{
		if(err) return console.log("there has been an error in isOver finding couple.",err);
		Restaurant.find({couple: couple._id}, (err, restaurants)=>{
			if(err) return console.log("there has been an error in isOver finding restaurants.",err);
			if(restaurants.length===1){
				res.redirect('/eatHere');
			} else return next();
		});
	});
};

//will redirect other user to restaurants when their turn is up.  
//*EDIT: This is dumb and unnecessary.  Refactor later
let notUsersTurn = (req,res,next)=>{
	Couple.findOne({_id: req.user.couple}, (err, couple)=>{
		if(err) return console.log("there has been an error in notUsersTurn finding couple.",err);
		if(req.user._id !== couple.whosUp()) return next();

		res.redirect('/Restaurants');
	});
};

//landing page for router.  Login functionality, checks if there's a session in play and allows for a new session search queries.
router.get('/',(req,res)=>{
	res.send('you got here!');
});

router.route('/signup')
	.get(mainController.getSignup)
	.post(mainController.postSignup);

router.route('/login')
	.get(mainController.getLogin)
	.post(mainController.postLogin);

//req.session.passport.user.id FTW!
router.route('/newSession')
	.get(authenticateUser, mainController.getNewSession)
	.post(authenticateUser, mainController.postNewSession);

 router.route('/Restaurants/:id')
 	.delete(authenticateUser, isUsersTurn, mainController.deleteRestaurants);

 //Main functional page of the app.  Will detect user and display appropriate information.  If not that user's turn will display Shakeitspeare poems(Stretch).
//Needs to determine how many restaurants there are.  If >5, reduce to 5.  If >2, reduce to 2.  If >1, reduce to 1.  If 1, That's where you go!
router.route('/Restaurants')
 	.get(authenticateUser, isUsersTurn, mainController.getRestaurants);

router.route('/eatHere')
	.get(authenticateUser, mainController.getEatHere);

router.route('/reset')
	.get(authenticateUser, mainController.getReset);

router.route('/waiting')
	.get(authenticateUser, isOver, notUsersTurn, mainController.getWaiting);

router.route('/favorites')
	.post(authenticateUser, mainController.postFavorites)
	.get(authenticateUser, mainController.getFavorites);

router.route('/logout')
	.get(mainController.getLogout);

//catch all bad pages
router.route('*')
	.get(mainController.getBadRoutes);


module.exports = router;